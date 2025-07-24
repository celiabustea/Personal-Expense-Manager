# Personal Expense Manager API Documentation

## Authentication
- All protected endpoints require a JWT in the `Authorization` header: `Bearer <token>`

## Endpoints

### Health Check
- `GET /health`
  - Returns: `{ status: 'OK', message: 'Backend server is running', timestamp: string }`

### Expenses
- `GET /api/expenses` (protected)
- `GET /api/expenses/:id` (protected)
- `POST /api/expenses` (protected)
  - Body: `{ amount: number, description: string, ... }`
- `PUT /api/expenses/:id` (protected)
  - Body: `{ amount?: number, description?: string, ... }`
- `DELETE /api/expenses/:id` (protected)

### Events
- `GET /api/events` (protected)
- `GET /api/events/:id` (protected)
- `POST /api/events` (protected)
- `PUT /api/events/:id` (protected)
- `DELETE /api/events/:id` (protected)

### Users (Supabase)
- `GET /api/supabase/users` (protected)

## Error Responses
- All errors return JSON: `{ error: string, [details]: any }`

## Notes
- All endpoints return standard HTTP status codes.
- Validation errors return 400 with details.
- Unauthorized/expired tokens return 401.
- Forbidden actions return 403.

---

For more details, see the source code or contact the project maintainer.
