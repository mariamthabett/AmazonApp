const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
};

// @desc   Login a user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  }

  res.status(401);
  throw new Error("Invalid email or password");
};

// @desc   Get logged-in user's profile
// @route  GET /api/auth/profile
// @access Private
const getProfile = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getProfile };
