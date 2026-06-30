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

// @desc   Update logged-in user's profile (name / email / phone / dob / password)
// @route  PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res) => {
  // نجيب المستخدم كامل (req.user من الميدلوير من غير الباسورد) عشان نقدر نعدّل ونحفظ
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    currentPassword,
    newPassword,
  } = req.body;

  // لو الإيميل اتغيّر: نتأكد إنه مش مستخدم لحد تاني
  if (email && email.toLowerCase() !== user.email) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      res.status(400);
      throw new Error("Email already registered");
    }
    user.email = email;
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

  // تغيير كلمة المرور (اختياري) — لازم كلمة المرور الحالية الصح
  if (newPassword) {
    if (!currentPassword) {
      res.status(400);
      throw new Error("Current password is required to set a new one");
    }
    const ok = await user.matchPassword(currentPassword);
    if (!ok) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    user.password = newPassword; // الـ pre-save hook بيعمل hash تلقائيًا
  }

  const saved = await user.save();

  res.json({
    _id: saved._id,
    firstName: saved.firstName,
    lastName: saved.lastName,
    name: saved.name,
    email: saved.email,
    phoneNumber: saved.phoneNumber,
    dateOfBirth: saved.dateOfBirth,
    role: saved.role,
    token: generateToken(saved._id),
  });
};

module.exports = { register, login, getProfile, updateProfile };
