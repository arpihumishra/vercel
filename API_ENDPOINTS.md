# 📋 API Endpoints Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🏥 Health & Info Endpoints

### GET /health
**Description**: Health check endpoint to verify API status  
**Access**: Public  
**Response**:
```json
{
  "success": true,
  "message": "Multi-Tenant Notes API is running",
  "timestamp": "2025-09-24T10:30:00.000Z",
  "environment": "development"
}
```

### GET /api
**Description**: API documentation and endpoint overview  
**Access**: Public  
**Response**: Complete API documentation with all available endpoints

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
**Description**: Login with email and password to get JWT token  
**Access**: Public  
**Rate Limit**: 5 requests per 15 minutes  
**Request Body**:
```json
{
  "email": "admin@acme.test",
  "password": "password"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f5e8b2c9a1b2c3d4e5f6g7",
      "email": "admin@acme.test",
      "role": "admin",
      "tenant": {
        "id": "64f5e8b2c9a1b2c3d4e5f6g8",
        "slug": "acme",
        "name": "Acme Corporation",
        "plan": "free"
      }
    }
  }
}
```

### GET /api/auth/profile
**Description**: Get current authenticated user's profile information  
**Access**: Private (requires authentication)  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f5e8b2c9a1b2c3d4e5f6g7",
      "email": "admin@acme.test",
      "role": "admin",
      "tenant": {
        "id": "64f5e8b2c9a1b2c3d4e5f6g8",
        "slug": "acme",
        "name": "Acme Corporation",
        "plan": "free"
      }
    }
  }
}
```

---

## 🏢 Tenant Management Endpoints

### GET /api/tenants/:slug
**Description**: Get tenant information including current plan and note usage  
**Access**: Private (same tenant only)  
**Headers**: `Authorization: Bearer <token>`  
**URL Parameters**: 
- `slug` (string): Tenant identifier (e.g., "acme", "globex")

**Example**: `GET /api/tenants/acme`  
**Response**:
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "64f5e8b2c9a1b2c3d4e5f6g8",
      "slug": "acme",
      "name": "Acme Corporation",
      "plan": "free",
      "maxNotes": 3,
      "currentNotes": 2,
      "canCreateNotes": true
    }
  }
}
```

### POST /api/tenants/:slug/upgrade
**Description**: Upgrade tenant subscription from Free to Pro plan  
**Access**: Private (Admin role required)  
**Headers**: `Authorization: Bearer <token>`  
**URL Parameters**: 
- `slug` (string): Tenant identifier to upgrade

**Example**: `POST /api/tenants/acme/upgrade`  
**Response**:
```json
{
  "success": true,
  "message": "Tenant successfully upgraded to Pro plan",
  "data": {
    "tenant": {
      "id": "64f5e8b2c9a1b2c3d4e5f6g8",
      "slug": "acme",
      "name": "Acme Corporation",
      "plan": "pro",
      "maxNotes": "unlimited"
    }
  }
}
```

---

## 📝 Notes CRUD Endpoints

### POST /api/notes
**Description**: Create a new note (subject to subscription limits)  
**Access**: Private (Admin & Member roles)  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "title": "Meeting Notes",
  "content": "Discussion points from today's quarterly review meeting..."
}
```
**Validation**:
- `title`: Required, 1-200 characters
- `content`: Required, 1-10,000 characters

**Response**:
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "note": {
      "id": "64f5e8b2c9a1b2c3d4e5f6g9",
      "title": "Meeting Notes",
      "content": "Discussion points from today's quarterly review meeting...",
      "createdBy": {
        "email": "user@acme.test",
        "role": "member"
      },
      "createdAt": "2025-09-24T10:30:00.000Z",
      "updatedAt": "2025-09-24T10:30:00.000Z"
    }
  }
}
```

**Error Response (Free Plan Limit Reached)**:
```json
{
  "success": false,
  "message": "Note limit reached. Current plan allows maximum 3 notes. Please upgrade to Pro for unlimited notes."
}
```

### GET /api/notes
**Description**: List all notes for the authenticated user's tenant with pagination  
**Access**: Private (Admin & Member roles)  
**Headers**: `Authorization: Bearer <token>`  
**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Notes per page (default: 10, max: 100)

**Example**: `GET /api/notes?page=1&limit=5`  
**Response**:
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "64f5e8b2c9a1b2c3d4e5f6g9",
        "title": "Meeting Notes",
        "content": "Discussion points...",
        "createdBy": {
          "email": "user@acme.test",
          "role": "member"
        },
        "createdAt": "2025-09-24T10:30:00.000Z",
        "updatedAt": "2025-09-24T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalNotes": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### GET /api/notes/:id
**Description**: Retrieve a specific note by ID (tenant-scoped)  
**Access**: Private (Admin & Member roles, same tenant only)  
**Headers**: `Authorization: Bearer <token>`  
**URL Parameters**: 
- `id` (string): MongoDB ObjectId of the note

**Example**: `GET /api/notes/64f5e8b2c9a1b2c3d4e5f6g9`  
**Response**:
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "64f5e8b2c9a1b2c3d4e5f6g9",
      "title": "Meeting Notes",
      "content": "Discussion points from today's quarterly review meeting...",
      "createdBy": {
        "email": "user@acme.test",
        "role": "member"
      },
      "createdAt": "2025-09-24T10:30:00.000Z",
      "updatedAt": "2025-09-24T10:30:00.000Z"
    }
  }
}
```

**Error Response (Not Found)**:
```json
{
  "success": false,
  "message": "Note not found"
}
```

### PUT /api/notes/:id
**Description**: Update an existing note (partial updates supported)  
**Access**: Private (Admin & Member roles, same tenant only)  
**Headers**: `Authorization: Bearer <token>`  
**URL Parameters**: 
- `id` (string): MongoDB ObjectId of the note

**Request Body** (all fields optional):
```json
{
  "title": "Updated Meeting Notes",
  "content": "Updated discussion points with action items..."
}
```

**Validation**:
- `title`: Optional, 1-200 characters if provided
- `content`: Optional, 1-10,000 characters if provided

**Response**:
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "note": {
      "id": "64f5e8b2c9a1b2c3d4e5f6g9",
      "title": "Updated Meeting Notes",
      "content": "Updated discussion points with action items...",
      "createdBy": {
        "email": "user@acme.test",
        "role": "member"
      },
      "createdAt": "2025-09-24T10:30:00.000Z",
      "updatedAt": "2025-09-24T10:35:00.000Z"
    }
  }
}
```

### DELETE /api/notes/:id
**Description**: Delete a specific note permanently  
**Access**: Private (Admin & Member roles, same tenant only)  
**Headers**: `Authorization: Bearer <token>`  
**URL Parameters**: 
- `id` (string): MongoDB ObjectId of the note

**Example**: `DELETE /api/notes/64f5e8b2c9a1b2c3d4e5f6g9`  
**Response**:
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

---

## 🔒 Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 5 requests per 15 minutes per IP

### Tenant Isolation
- All endpoints automatically filter data by authenticated user's tenant
- Cross-tenant access is impossible and returns 403 Forbidden
- Middleware validates tenant access on every request

### Role-Based Access
- **Admin**: Full access + tenant management (upgrade subscription)
- **Member**: Full CRUD access to notes within their tenant

### Input Validation
- All request bodies validated with express-validator
- Comprehensive error messages for validation failures
- Protection against injection attacks

---

## 🧪 Test Account Credentials

| Email | Password | Role | Tenant | Description |
|-------|----------|------|--------|-------------|
| admin@acme.test | password | Admin | Acme | Can upgrade subscription + all note operations |
| user@acme.test | password | Member | Acme | Can perform CRUD operations on notes |
| admin@globex.test | password | Admin | Globex | Can upgrade subscription + all note operations |
| user@globex.test | password | Member | Globex | Can perform CRUD operations on notes |

---

## 📊 Subscription Plans

### Free Plan
- **Limit**: Maximum 3 notes per tenant
- **Default**: All tenants start with Free plan
- **Restriction**: API blocks creation of 4th note with descriptive error

### Pro Plan
- **Limit**: Unlimited notes
- **Upgrade**: Only admins can upgrade via `POST /tenants/:slug/upgrade`
- **Effect**: Note creation limits are immediately lifted

---

## ❌ Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden (Role)
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### 403 Forbidden (Tenant)
```json
{
  "success": false,
  "message": "Access denied. You can only access resources within your tenant."
}
```

### 400 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required and must be between 1 and 200 characters",
      "value": ""
    }
  ]
}
```

### 429 Rate Limited
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

---

## 🔧 Testing Commands

### Using curl

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'
```

**Create Note** (replace YOUR_TOKEN):
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Note","content":"This is a test note"}'
```

**List Notes**:
```bash
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Upgrade Subscription**:
```bash
curl -X POST http://localhost:3000/api/tenants/acme/upgrade \
  -H "Authorization: Bearer ADMIN_TOKEN"
```