# Multi-Tenant Notes API - Setup Instructions

## Prerequisites

Before running the application, ensure you have:

1. **Node.js 16+** installed
2. **MongoDB** running locally on port 27017

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
# If installed via installer
net start MongoDB

# If using MongoDB Community Server
mongod --dbpath "C:\data\db"
```

**macOS:**
```bash
# Using Homebrew
brew services start mongodb/brew/mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
# Using systemd
sudo systemctl start mongod

# Or manually
mongod --dbpath /var/lib/mongodb
```

### 3. Seed the Database
```bash
npm run seed
```

### 4. Start the API Server
```bash
npm start          # Production mode
npm run dev        # Development mode with nodemon
```

## Quick API Test

Once the server is running, test the API:

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Login Test
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'
```

### 3. Create a Note (replace YOUR_TOKEN with the token from login)
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Note","content":"This is a test"}'
```

## MongoDB Connection Issues?

If you can't start MongoDB locally, you can:

1. **Use MongoDB Atlas (Free Cloud):**
   - Sign up at https://cloud.mongodb.com/
   - Create a free cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

2. **Use Docker:**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## Troubleshooting

- **Port 3000 in use?** Change `PORT` in `.env`
- **Connection refused?** Ensure MongoDB is running
- **Permission errors?** Check MongoDB data directory permissions
- **PowerShell issues?** Use `npm.cmd` instead of `npm`

## API Documentation

Visit `http://localhost:3000/api` once the server is running for full API documentation.