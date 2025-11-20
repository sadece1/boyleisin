# CampScape Marketplace - Backend API

Backend API for the CampScape camping marketplace application built with Node.js, Express, TypeScript, and MySQL.

## 🚀 Features

- ✅ User authentication and authorization (JWT)
- ✅ Campsite CRUD operations
- ✅ Gear (camping equipment) catalog management
- ✅ Blog post management
- ✅ Category management (hierarchical structure)
- ✅ Reservation system
- ✅ Review and rating system
- ✅ Favorites management
- ✅ Contact form handling
- ✅ Appointment booking system
- ✅ Newsletter subscription management
- ✅ Image upload and management
- ✅ Search and filtering capabilities
- ✅ Admin dashboard APIs

## 🛠 Tech Stack

- **Node.js** 18+ with Express.js
- **TypeScript** for type safety
- **MySQL** 8.0 database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **Joi** for data validation
- **Winston** for logging
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Express-rate-limit** for API protection

## 📦 Installation

1. **Clone the repository and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   Edit `.env` file with your database credentials and other settings.

5. **Set up the database:**
   - Create MySQL database
   - Run migration:
     ```bash
     npm run db:migrate
     ```
   - Seed database with sample data (optional but recommended):
     ```bash
     npm run db:seed
     ```
   - Or run both at once:
     ```bash
     npm run db:reset
     ```

**Default Login Credentials (after seeding):**
- **Admin**: `admin@campscape.com` / `Admin123!`
- **User 1**: `user1@campscape.com` / `User123!`
- **User 2**: `user2@campscape.com` / `User123!`

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## 🐳 Docker Setup

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- MySQL database on port 3306
- Backend API on port 3000

### Using Docker Only

```bash
docker build -t campscape-backend .
docker run -p 3000:3000 --env-file .env campscape-backend
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Health Check
- `GET /health` - Server health check

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Security headers with Helmet
- File upload validation
- Role-based access control

## 📁 Project Structure

```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── migrations/     # Database migrations
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── validators/     # Joi validation schemas
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── uploads/            # File upload directory
├── logs/              # Log files
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run lint` - Run ESLint

## 📊 Database Schema

See `src/migrations/schema.sql` for the complete database schema.

## 🧪 Testing

Coming soon...

## 📄 License

MIT
