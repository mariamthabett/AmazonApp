const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    dateOfBirth,
    phoneNumber,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Please provide first name, last name, email and password");
  }

  // confirmPassword is validated here only — never stored in the database
  if (confirmPassword !== undefined && password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    phoneNumber,
  });

  res.status(201).json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
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
      firstName: user.firstName,
      lastName: user.lastName,
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
