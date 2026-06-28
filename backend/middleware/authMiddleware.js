const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT and attach the user to the request
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }
      return next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
  res.status(401);
  throw new Error("Not authorized, no token");
};

// Allow only admins through
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("Not authorized as admin");
};

module.exports = { protect, admin };
