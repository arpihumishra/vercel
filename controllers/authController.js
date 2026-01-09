const User = require("../models/User");
const Tenant = require("../models/Tenant");
const { generateToken } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).populate("tenantId");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    console.log(user);
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          tenant: {
            id: user?.tenantId?._id,
            slug: user?.tenantId?.slug,
            name: user?.tenantId?.name,
            plan: user?.tenantId?.plan,
          },
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
          tenant: {
            id: req.tenant._id,
            slug: req.tenant.slug,
            name: req.tenant.name,
            plan: req.tenant.plan,
          },
        },
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

const Register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).populate("tenantId");

    if (user) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }
    const newUser = new User({
      email,
      password,
      tenantId: "68d428cdd1ecdaa91eb54ab8",
    });
    await newUser.save();
    const token = generateToken(newUser._id);
    res.json({
      success: true,
      message: "Register successful",
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

module.exports = {
  login,
  getProfile,
  Register,
};
