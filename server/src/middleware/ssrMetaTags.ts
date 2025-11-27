import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Server-side meta tags middleware
 * Injects dynamic meta tags into HTML for SEO and social sharing
 * Works even without full SSR - at least provides meta tags server-side
 */
export const ssrMetaTags = (req: Request, res: Response, next: NextFunction) => {
  // Only process HTML requests (not API, assets, etc.)
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/assets') ||
    req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/i)
  ) {
    return next();
  }

  // Read the index.html file
  // Path: server/dist -> ../dist (from compiled server code)
  const distPath = path.join(process.cwd(), 'dist/index.html');
  
  if (!fs.existsSync(distPath)) {
    return next();
  }

  let html = fs.readFileSync(distPath, 'utf-8');

  // Extract route information
  const route = req.path === '/' ? 'home' : req.path.slice(1).replace(/\//g, '-');
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fullUrl = `${baseUrl}${req.originalUrl}`;

  // Default meta tags
  let title = 'WeCamp - Kamp Alanı Pazar Yeri | Doğada Unutulmaz Deneyimler';
  let description = 'Doğada unutulmaz kamp deneyimleri için kamp alanları ve kamp malzemeleri. Türkiye\'nin en kapsamlı kamp pazaryeri.';
  let image = `${baseUrl}/tent-4534210_1280.jpg`;
  let keywords = 'kamp, kamp alanı, kamp malzemeleri, doğa, outdoor, kamp çadırı, kamp ekipmanları';

  // Route-specific meta tags
  switch (req.path) {
    case '/':
      title = 'WeCamp - Kamp Alanı Pazar Yeri | Doğada Unutulmaz Deneyimler';
      description = 'Doğada unutulmaz kamp deneyimleri için kamp alanları ve kamp malzemeleri. 200+ kamp alanı, 500+ kamp malzemesi ile doğada unutulmaz anılar biriktirin.';
      break;
    case '/blog':
      title = 'Kamp Blog Yazıları - Rehberler, İpuçları ve Deneyimler | WeCamp';
      description = 'Kamp rehberleri, ipuçları, deneyimler ve doğa aktiviteleri hakkında en güncel blog yazıları.';
      keywords = 'kamp blog, kamp rehberi, kamp ipuçları, doğa aktiviteleri, kamp deneyimleri';
      break;
    case '/gear':
      title = 'Kamp Malzemeleri - Kiralık Kamp Ekipmanları | WeCamp';
      description = 'Kaliteli kamp malzemeleri ve ekipmanları kiralayın. Çadır, uyku tulumu, mat, ocak ve daha fazlası.';
      keywords = 'kamp malzemeleri, kiralık kamp ekipmanları, kamp çadırı, uyku tulumu, kamp ocağı';
      break;
    case '/about':
      title = 'Hakkımızda - WeCamp Kamp Pazar Yeri';
      description = 'WeCamp hakkında bilgi edinin. Doğada unutulmaz deneyimler için kamp alanları ve kamp malzemeleri pazaryeri.';
      break;
    case '/contact':
      title = 'İletişim - WeCamp';
      description = 'WeCamp ile iletişime geçin. Sorularınız, önerileriniz ve destek talepleriniz için bizimle iletişime geçin.';
      break;
    default:
      // Try to extract from route
      if (req.path.startsWith('/blog/')) {
        title = 'Blog Yazısı - WeCamp';
      } else if (req.path.startsWith('/gear/')) {
        title = 'Kamp Malzemesi Detayı - WeCamp';
      }
  }

  // Inject meta tags into HTML
  const metaTags = `
    <!-- Server-side injected meta tags for SEO -->
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:site_name" content="WeCamp" />
    <meta property="og:locale" content="tr_TR" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${fullUrl}" />
  `;

  // Insert meta tags before closing </head>
  html = html.replace('</head>', `${metaTags}\n</head>`);

  // Update title if it exists
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Send modified HTML
  res.send(html);
};

