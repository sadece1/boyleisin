import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { enforceHttps } from './middleware/httpsEnforcement';
import { redirectMiddleware } from './middleware/redirects';
import { goneHandler } from './middleware/goneHandler';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import campsiteRoutes from './routes/campsites.routes';
import gearRoutes from './routes/gear.routes';
import blogRoutes from './routes/blog.routes';
import categoryRoutes from './routes/categories.routes';
import reservationRoutes from './routes/reservations.routes';
import reviewRoutes from './routes/reviews.routes';
import favoriteRoutes from './routes/favorites.routes';
import contactRoutes from './routes/contact.routes';
import appointmentRoutes from './routes/appointments.routes';
import newsletterRoutes from './routes/newsletter.routes';
import uploadRoutes from './routes/upload.routes';
import searchRoutes from './routes/search.routes';
import adminRoutes from './routes/admin.routes';
import apiKeysRoutes from './routes/apiKeys.routes';
import referencesRoutes from './routes/references.routes';
import brandsRoutes from './routes/brands.routes';
import userOrdersRoutes from './routes/userOrders.routes';
import { getAll as getAllMessages } from './controllers/contactController';
import { authenticate, authorizeAdmin } from './middleware/auth';
import { staticCacheHeaders, cacheMiddleware, noCache } from './middleware/cache';

dotenv.config();

const app: Application = express();

// Trust proxy
app.set('trust proxy', 1);

// HTTPS enforcement (redirect HTTP to HTTPS in production)
// Disabled for Nginx proxy - Nginx handles HTTP/HTTPS
// if (process.env.NODE_ENV === 'production') {
//   app.use(enforceHttps);
// }

// Security middleware with enhanced CSP and security headers
// Implements OWASP best practices and security hardening requirements
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Removed 'unsafe-inline' for styleSrc - use nonces or hashes instead
      styleSrc: ["'self'"], // Strict CSP - no inline styles
      scriptSrc: ["'self'"], // Strict CSP - no inline scripts
      imgSrc: ["'self'", "data:", "https:"], // Removed http: - HTTPS only
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'https://localhost:5173'],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // X-Frame-Options: DENY equivalent
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Allow images from external sources
  hsts: {
    maxAge: 31536000, // 1 year (OWASP recommendation)
    includeSubDomains: true, // Apply to all subdomains
    preload: true, // Enable HSTS preload
  },
  // Additional security headers
  xFrameOptions: { action: 'deny' }, // Clickjacking protection
  xContentTypeOptions: true, // MIME type sniffing protection
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false,
}));

// Permissions-Policy header (manually added - not supported in Helmet 7.1.0)
// Restricts browser features to prevent abuse
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), fullscreen=(self), picture-in-picture=()'
  );
  next();
});

// CORS configuration with enhanced security
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [process.env.FRONTEND_URL || 'http://localhost:5173'];
    
    // Allow requests with no origin (mobile apps, Postman, curl, Nginx proxy, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Cookie parser middleware (for HttpOnly cookies)
app.use(cookieParser());

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: process.env.MAX_JSON_SIZE || '1mb', // Reduced default for security
  verify: (req, res, buf, encoding) => {
    // Additional JSON validation can be added here
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      // Cannot send response in verify, just throw error
      throw new Error('Invalid JSON format');
    }
  },
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_URLENCODED_SIZE || '1mb',
  parameterLimit: 100, // Limit number of parameters
}));

// Cache middleware for static assets
app.use(staticCacheHeaders);

// Serve uploaded files
// Serve from both /uploads and /api/uploads for compatibility
const uploadsDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// Rate limiting - General API
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500', 10), // Increased from 100 to 500
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks, categories, and admin endpoints (frequently accessed)
    const path = req.path || req.url || '';
    return path === '/health' || 
           path === '/api/health' ||
           path.startsWith('/api/categories') ||
           path.startsWith('/categories') ||
           path.startsWith('/api/admin'); // Admin endpoints are authenticated, so safe to skip rate limiting
  },
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Stricter rate limiting for upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: { error: 'Too many file uploads, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting - categories route is excluded via skip function
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/upload', uploadLimiter);

// Enhanced health check endpoint with detailed diagnostics
const healthCheck = async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  const healthData: any = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    checks: {} as any,
  };

  let overallHealthy = true;

  // Database health check
  try {
    const { testConnection, getConnectionHealth } = await import('./config/database');
    await testConnection(1); // Single attempt for health check
    
    const dbHealth = getConnectionHealth();
    healthData.checks.database = {
      status: 'healthy',
      ...dbHealth,
    };
  } catch (error: any) {
    overallHealthy = false;
    const { getConnectionHealth } = await import('./config/database');
    const dbHealth = getConnectionHealth();
    
    healthData.checks.database = {
      status: 'unhealthy',
      error: error.message,
      ...dbHealth,
    };
  }

  // Memory usage check
  const memoryUsage = process.memoryUsage();
  const memoryThreshold = 0.9; // 90% threshold
  const memoryUsagePercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
  
  healthData.checks.memory = {
    status: memoryUsagePercent < memoryThreshold ? 'healthy' : 'warning',
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
    rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
    usagePercent: Math.round(memoryUsagePercent * 100),
  };

  if (memoryUsagePercent >= memoryThreshold) {
    overallHealthy = false;
  }

  // Response time
  const responseTime = Date.now() - startTime;
  healthData.responseTime = responseTime;
  healthData.checks.responseTime = {
    status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'warning' : 'slow',
    ms: responseTime,
  };

  // Overall status
  healthData.success = overallHealthy;
  healthData.status = overallHealthy ? 'healthy' : 'unhealthy';

  const statusCode = overallHealthy ? 200 : 503;
  
  // Add Retry-After header for 503 (SEO best practice)
  if (statusCode === 503) {
    res.setHeader('Retry-After', '30'); // Retry after 30 seconds
  }

  res.status(statusCode).json(healthData);
};

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// robots.txt handler
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# robots.txt for ${req.get('host') || 'sadece1deneme.com'}
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Allow important pages
Allow: /
Allow: /blog
Allow: /gear
Allow: /category/
Allow: /about
Allow: /contact
Allow: /references

# Sitemap location
Sitemap: https://${req.get('host') || 'sadece1deneme.com'}/sitemap.xml
`);
});

// SEO and URL Management Middleware
// 1. 410 Gone handler (permanently removed content) - must come before redirects
app.use(goneHandler);

// 2. 301 Redirects (old URLs to new URLs) - preserves PageRank
app.use(redirectMiddleware);

// API routes
// Apply cache middleware to frequently accessed read-only endpoints
// Cache GET requests for 5 minutes to reduce TTFB
app.use('/api/campsites', cacheMiddleware({ 
  condition: (req) => req.method === 'GET' && !req.path.includes('/admin')
}));
app.use('/api/gear', cacheMiddleware({ 
  condition: (req) => req.method === 'GET' && !req.path.includes('/admin')
}));
app.use('/api/blog', cacheMiddleware({ 
  condition: (req) => req.method === 'GET' && !req.path.includes('/admin')
}));
app.use('/api/blogs', cacheMiddleware({ 
  condition: (req) => req.method === 'GET' && !req.path.includes('/admin')
}));
app.use('/api/categories', cacheMiddleware({ 
  condition: (req) => req.method === 'GET'
}));

app.use('/api/auth', noCache, authRoutes); // No cache for auth endpoints
app.use('/api/campsites', campsiteRoutes);
app.use('/api/gear', gearRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/blogs', blogRoutes); // Alias for frontend compatibility
app.use('/api/categories', categoryRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/contact', contactRoutes);
// Frontend compatibility: /api/messages -> contact messages
app.get('/api/messages', authenticate, authorizeAdmin, getAllMessages);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/newsletters', newsletterRoutes); // Alias for frontend compatibility
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/api-keys', apiKeysRoutes);
app.use('/api/references', referencesRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/user-orders', userOrdersRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
