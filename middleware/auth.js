const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

// Middleware to verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.userId).populate("tenantId");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid. User not found.",
        });
      }

      // Add user and tenant info to request
      req.user = user;
      req.tenant = user;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid.",
      });
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
};

// Middleware to check if user belongs to specified tenant
const requireTenant = (paramName = "slug") => {
  return async (req, res, next) => {
    try {
      const tenantSlug = req.params[paramName];

      if (!tenantSlug) {
        return res.status(400).json({
          success: false,
          message: "Tenant identifier is required",
        });
      }

      // Check if the user's tenant matches the requested tenant
      if (req.tenant.slug !== tenantSlug) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You can only access resources within your tenant.",
        });
      }

      next();
    } catch (error) {
      console.error("Tenant validation error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during tenant validation",
      });
    }
  };
};

module.exports = {
  generateToken,
  authenticate,
  requireAdmin,
  requireTenant,
};
