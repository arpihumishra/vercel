# Multi-Tenant Notes API

A secure, multi-tenant notes application with JWT authentication, role-based authorization, and subscription-based feature gating.

## 🏗️ Multi-Tenancy Architecture

This application implements **shared schema with tenant ID** approach for multi-tenancy:

### Why Shared Schema with Tenant ID?

- **Simplicity**: Single database and schema to manage
- **Cost-effective**: Shared infrastructure across all tenants
- **Easy maintenance**: Single codebase and deployment
- **Scalability**: Good performance for moderate tenant counts
- **Data isolation**: Strict tenant separation through middleware

### Implementation Details

- All data models include a `tenantId` field for isolation
- Middleware enforces tenant boundaries on every request
- Database indexes optimize queries by tenant
- No tenant can access another tenant's data through any endpoint

### Trade-offs Considered

- **vs Database-per-tenant**: Less infrastructure complexity, but shared resources
- **vs Schema-per-tenant**: Simpler migrations and maintenance, but less isolation
- **Security**: Strong logical isolation with middleware validation

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. Start MongoDB locally or update `MONGODB_URI` in `.env`

4. Seed the database with test accounts:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

The API will be available at `http://localhost:3000`

## 🔐 Authentication & Authorization

### JWT Authentication
- Login endpoint: `POST /api/auth/login`
- Include token in requests: `Authorization: Bearer <token>`
- Tokens expire in 24 hours (configurable)

### Roles & Permissions

| Role   | Permissions                                    |
|--------|-----------------------------------------------|
| Admin  | All Member permissions + invite users + upgrade subscription |
| Member | Create, read, update, delete notes within their tenant |

### Test Accounts

All test accounts use password: `password`

| Email               | Role   | Tenant | 
|--------------------|--------|--------|
| admin@acme.test    | Admin  | Acme   |
| user@acme.test     | Member | Acme   |
| admin@globex.test  | Admin  | Globex |
| user@globex.test   | Member | Globex |

## 📋 API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@acme.test",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "admin@acme.test", 
      "role": "admin",
      "tenant": {
        "id": "tenant-id",
        "slug": "acme",
        "name": "Acme Corporation",
        "plan": "free"
      }
    }
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Tenant Management

#### Get Tenant Info
```http
GET /api/tenants/acme
Authorization: Bearer <token>
```

#### Upgrade Subscription (Admin only)
```http
POST /api/tenants/acme/upgrade
Authorization: Bearer <token>
```

### Notes CRUD

#### Create Note
```http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Meeting Notes",
  "content": "Discussion points from today's meeting..."
}
```

#### List Notes
```http
GET /api/notes?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Specific Note
```http
GET /api/notes/:id
Authorization: Bearer <token>
```

#### Update Note
```http
PUT /api/notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Note
```http
DELETE /api/notes/:id
Authorization: Bearer <token>
```

## 💎 Subscription Plans

### Free Plan
- **Limit**: Maximum 3 notes per tenant
- **Default**: All tenants start with Free plan
- **Enforcement**: API blocks creation of 4th note

### Pro Plan
- **Limit**: Unlimited notes
- **Upgrade**: Admin can upgrade via `POST /tenants/:slug/upgrade`
- **Effect**: Immediate removal of note creation limits

### Feature Gating
- Note creation checks current count against tenant's plan
- Clear error messages when limits are reached
- Upgrade suggestions included in error responses

## 🔒 Security Features

### Tenant Isolation
- Every request validates tenant access
- Database queries automatically scope to user's tenant
- No cross-tenant data leakage possible

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- Per-IP tracking with proxy support

### Input Validation
- Request validation using express-validator
- Comprehensive error messages
- SQL injection and XSS protection

### Password Security
- Bcrypt hashing with salt rounds: 12
- Minimum password requirements
- No password exposure in API responses

## 🗄️ Database Schema

### Tenant Model
```javascript
{
  slug: String,      // URL-safe identifier (e.g., 'acme')
  name: String,      // Display name
  plan: String,      // 'free' | 'pro' 
  maxNotes: Number,  // Plan-based limit (-1 = unlimited)
  createdAt: Date,
  updatedAt: Date
}
```

### User Model  
```javascript
{
  email: String,     // Unique login identifier
  password: String,  // Bcrypt hashed
  role: String,      // 'admin' | 'member'
  tenantId: ObjectId,// Reference to tenant
  createdAt: Date,
  updatedAt: Date
}
```

### Note Model
```javascript
{
  title: String,     // Max 200 characters
  content: String,   // Max 10,000 characters  
  tenantId: ObjectId,// Tenant isolation
  createdBy: ObjectId, // User reference
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the API

### Using curl

1. **Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'
```

2. **Create Note**:
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Note","content":"This is a test note"}'
```

3. **List Notes**:
```bash
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

Import this collection to test all endpoints:

1. Set base URL: `http://localhost:3000`
2. Login with test account to get token
3. Add token to Authorization header for protected routes
4. Test tenant isolation by switching between accounts

## 🚀 Deployment

### Environment Variables

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/multi-tenant-notes
JWT_SECRET=your-super-secure-jwt-secret-change-in-production
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Considerations

- Use strong JWT secrets (32+ characters)
- Enable MongoDB authentication
- Set up reverse proxy (nginx/Apache)
- Configure CORS for your frontend domain
- Enable request logging
- Set up monitoring and health checks
- Use environment-specific rate limits

## 📁 Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── notesController.js   # Notes CRUD operations
│   └── tenantController.js  # Tenant management
├── middleware/
│   ├── auth.js             # JWT & authorization
│   ├── errorHandler.js     # Error handling
│   └── rateLimiting.js     # Rate limiting
├── models/
│   ├── Note.js             # Note schema
│   ├── Tenant.js           # Tenant schema  
│   └── User.js             # User schema
├── routes/
│   ├── auth.js             # Auth endpoints
│   ├── notes.js            # Notes endpoints
│   └── tenants.js          # Tenant endpoints
├── scripts/
│   └── seedData.js         # Database seeding
├── validators/
│   └── validators.js       # Input validation rules
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies & scripts
├── README.md              # This file
└── server.js              # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.