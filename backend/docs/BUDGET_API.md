# Budget API Documentation

## Overview
The Budget API provides endpoints for managing user budgets, including creating, updating, deleting, and tracking budget expenses.

## Base URL
```
http://localhost:5000/budgets
```

## Authentication
All budget endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Budgets
**GET** `/budgets`

Returns all budgets for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Monthly Groceries",
    "amount": 500.00,
    "spent": 250.50,
    "category": "FOOD",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "userId": 123,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### 2. Get Budget by ID
**GET** `/budgets/:id`

Returns a specific budget by ID.

**Parameters:**
- `id` (number): Budget ID

**Response:**
```json
{
  "id": 1,
  "name": "Monthly Groceries",
  "amount": 500.00,
  "spent": 250.50,
  "category": "FOOD",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "userId": 123,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### 3. Create Budget
**POST** `/budgets`

Creates a new budget.

**Request Body:**
```json
{
  "name": "Monthly Groceries",
  "amount": 500.00,
  "category": "FOOD",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**Validation Rules:**
- `name`: Required, string, 1-100 characters
- `amount`: Required, number, > 0
- `category`: Required, string, must be valid TransactionCategory
- `startDate`: Required, valid ISO date
- `endDate`: Required, valid ISO date, must be after startDate

**Response:**
```json
{
  "id": 1,
  "name": "Monthly Groceries",
  "amount": 500.00,
  "spent": 0,
  "category": "FOOD",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "userId": 123,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### 4. Update Budget
**PUT** `/budgets/:id`

Updates an existing budget.

**Parameters:**
- `id` (number): Budget ID

**Request Body (all fields optional):**
```json
{
  "name": "Updated Budget Name",
  "amount": 600.00,
  "category": "ENTERTAINMENT",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Budget Name",
  "amount": 600.00,
  "spent": 250.50,
  "category": "ENTERTAINMENT",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "userId": 123,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

### 5. Update Budget Spent Amount
**PUT** `/budgets/:id/spent`

Adds to the spent amount of a budget (for expense tracking).

**Parameters:**
- `id` (number): Budget ID

**Request Body:**
```json
{
  "amount": 25.50
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Monthly Groceries",
  "amount": 500.00,
  "spent": 276.00,
  "category": "FOOD",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "userId": 123,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T12:30:00.000Z"
}
```

### 6. Delete Budget
**DELETE** `/budgets/:id`

Deletes a budget.

**Parameters:**
- `id` (number): Budget ID

**Response:**
- Status: 204 No Content

### 7. Get Budget Categories
**GET** `/budgets/categories`

Returns available budget categories.

**Response:**
```json
[
  "FOOD",
  "TRANSPORT",
  "ENTERTAINMENT",
  "HEALTHCARE",
  "UTILITIES",
  "SHOPPING",
  "EDUCATION",
  "TRAVEL",
  "OTHER"
]
```

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "User not authenticated"
}
```

### 404 Not Found
```json
{
  "error": "Budget not found"
}
```

### 409 Conflict
```json
{
  "error": "Budget already exists for this category and time period"
}
```

## Usage Examples

### Create a monthly food budget
```bash
curl -X POST http://localhost:5000/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "January Food Budget",
    "amount": 400,
    "category": "FOOD",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }'
```

### Track an expense against a budget
```bash
curl -X PUT http://localhost:5000/budgets/1/spent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 45.67
  }'
```

### Get all budgets
```bash
curl -X GET http://localhost:5000/budgets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
