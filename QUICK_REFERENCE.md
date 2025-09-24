# 🚀 Quick API Reference

## Available Endpoints

### 🔐 Authentication
- `POST /api/auth/login` - Login to get JWT token
- `GET /api/auth/profile` - Get current user profile

### 🏢 Tenant Management  
- `GET /api/tenants/:slug` - Get tenant info (same tenant only)
- `POST /api/tenants/:slug/upgrade` - Upgrade to Pro plan (admin only)

### 📝 Notes Management
- `POST /api/notes` - Create new note (subscription limits apply)
- `GET /api/notes` - List all tenant notes (paginated)
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### 🏥 System
- `GET /health` - Health check
- `GET /api` - Full API documentation

## 🔑 Test Accounts (password: "password")
- admin@acme.test (Admin, Acme)
- user@acme.test (Member, Acme)
- admin@globex.test (Admin, Globex)  
- user@globex.test (Member, Globex)

## 📋 Subscription Plans
- **Free**: 3 notes max
- **Pro**: Unlimited notes

## 🧪 Quick Test
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'

# 2. Create Note (use token from step 1)
curl -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Note","content":"Hello World!"}'

# 3. List Notes
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

See `API_ENDPOINTS.md` for detailed documentation with request/response examples.