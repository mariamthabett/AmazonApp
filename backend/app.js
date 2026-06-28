require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// نبدأ الاتصال بقاعدة البيانات (مع caching جوّه db.js عشان الـ serverless)
connectDB().catch((err) =>
  console.error(`Initial DB connection error: ${err.message}`)
);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Amazon App API is running 🚀" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
