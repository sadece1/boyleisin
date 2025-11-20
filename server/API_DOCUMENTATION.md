# CampScape API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile (Auth required)
- `PUT /api/auth/profile` - Update user profile (Auth required)

### Campsites
- `GET /api/campsites` - Get all campsites (with filters)
- `GET /api/campsites/:id` - Get single campsite
- `POST /api/campsites` - Create campsite (Auth required)
- `PUT /api/campsites/:id` - Update campsite (Auth required)
- `DELETE /api/campsites/:id` - Delete campsite (Auth required)
- `GET /api/campsites/search` - Search campsites
- `GET /api/campsites/filters` - Get filter options

### Gear
- `GET /api/gear` - Get all gear items (with filters)
- `GET /api/gear/:id` - Get single gear item
- `POST /api/gear` - Create gear item (Auth required)
- `PUT /api/gear/:id` - Update gear item (Auth required)
- `DELETE /api/gear/:id` - Delete gear item (Auth required)
- `GET /api/gear/search` - Search gear items
- `GET /api/gear/by-category/:categoryId` - Get gear by category
- `GET /api/gear/recommended/:id` - Get recommended gear

### Blog
- `GET /api/blog` - Get all blog posts (with filters)
- `GET /api/blog/:id` - Get single blog post
- `POST /api/blog` - Create blog post (Admin only)
- `PUT /api/blog/:id` - Update blog post (Admin only)
- `DELETE /api/blog/:id` - Delete blog post (Admin only)
- `GET /api/blog/featured` - Get featured posts
- `GET /api/blog/search` - Search blog posts
- `GET /api/blog/recommended/:id` - Get recommended posts

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Reservations
- `GET /api/reservations` - Get user reservations (Auth required)
- `GET /api/reservations/:id` - Get single reservation (Auth required)
- `POST /api/reservations` - Create reservation (Auth required)
- `PUT /api/reservations/:id` - Update reservation (Auth required)
- `DELETE /api/reservations/:id` - Cancel reservation (Auth required)
- `GET /api/reservations/availability` - Check availability

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get single review
- `GET /api/reviews/campsite/:campsiteId` - Get campsite reviews
- `GET /api/reviews/gear/:gearId` - Get gear reviews
- `POST /api/reviews` - Create review (Auth required)
- `PUT /api/reviews/:id` - Update review (Auth required)
- `DELETE /api/reviews/:id` - Delete review (Auth required)

### Favorites
- `GET /api/favorites` - Get user favorites (Auth required)
- `POST /api/favorites` - Add to favorites (Auth required)
- `DELETE /api/favorites/:id` - Remove from favorites (Auth required)
- `GET /api/favorites/check` - Check if item is favorited (Auth required)

### Contact
- `POST /api/contact` - Send contact message
- `GET /api/contact/messages` - Get all messages (Admin only)
- `PUT /api/contact/messages/:id/read` - Mark message as read (Admin only)
- `DELETE /api/contact/messages/:id` - Delete message (Admin only)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `GET /api/newsletter/subscribers` - Get all subscribers (Admin only)

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get all appointments (Admin only)
- `GET /api/appointments/:id` - Get single appointment (Admin only)
- `PUT /api/appointments/:id` - Update appointment (Admin only)
- `DELETE /api/appointments/:id` - Delete appointment (Admin only)

### Upload
- `POST /api/upload/image` - Upload single image (Auth required)
- `POST /api/upload/images` - Upload multiple images (Auth required)
- `DELETE /api/upload/:filename` - Delete uploaded file (Auth required)

### Search
- `GET /api/search` - Global search
- `GET /api/search/blogs` - Search blogs only
- `GET /api/search/gear` - Search gear only
- `GET /api/search/campsites` - Search campsites only

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats (Admin only)
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:id` - Update user (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Pagination

Endpoints that support pagination accept these query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Response includes pagination info:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API has rate limiting:
- 100 requests per 15 minutes per IP address

## File Upload

- Supported formats: JPG, PNG, GIF, WEBP
- Max file size: 10MB
- Max files per request: 10












