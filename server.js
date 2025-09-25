const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const { generalLimiter } = require("./middleware/rateLimiting");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy (important for rate limiting behind reverse proxies)
app.set("trust proxy", 1);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://vercel-27w6.vercel.app"]
        : [
            "http://localhost:3001",
            "http://localhost:5173",
            "http://localhost:5174",
            "https://vercel-27w6.vercel.app",
          ],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use("/api/", generalLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Multi-Tenant Notes API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Multi-Tenant Notes API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/login": "Login with email and password",
        "GET /api/auth/profile": "Get current user profile (requires auth)",
      },
      tenants: {
        "GET /api/tenants/:slug":
          "Get tenant information (requires auth, same tenant)",
        "POST /api/tenants/:slug/upgrade":
          "Upgrade tenant to Pro plan (requires auth, admin role)",
      },
      notes: {
        "POST /api/notes": "Create a new note (requires auth)",
        "GET /api/notes": "Get all notes for current tenant (requires auth)",
        "GET /api/notes/:id": "Get specific note (requires auth, same tenant)",
        "PUT /api/notes/:id": "Update note (requires auth, same tenant)",
        "DELETE /api/notes/:id": "Delete note (requires auth, same tenant)",
      },
    },
    testAccounts: {
      "admin@acme.test": "Admin user for Acme tenant",
      "user@acme.test": "Member user for Acme tenant",
      "admin@globex.test": "Admin user for Globex tenant",
      "user@globex.test": "Member user for Globex tenant",
      password: "password (for all test accounts)",
    },
  });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tenants", require("./routes/tenants"));
app.use("/api/notes", require("./routes/notes"));

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🚀 Multi-Tenant Notes API Server started!
📊 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
📖 API Docs: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health

🔑 Test Accounts (password: password):
   • admin@acme.test (Admin, Acme)
   • user@acme.test (Member, Acme)  
   • admin@globex.test (Admin, Globex)
   • user@globex.test (Member, Globex)

🧪 Run seed script: npm run seed
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

module.exports = app;
