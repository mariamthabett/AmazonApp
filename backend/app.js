require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// نبدأ تسخين الاتصال بقاعدة البيانات (مع caching جوّه db.js عشان الـ serverless)
connectDB().catch((err) =>
  console.error(`Initial DB connection error: ${err.message}`)
);

const app = express();

// نثق في الـ proxy (Vercel) عشان rate-limit يقرأ الـ IP صح
app.set("trust proxy", 1);

// هيدرات أمان (helmet) — بنطفّي CSP عشان مايتعارضش مع الـ API
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

// CORS: لو ضبطت CLIENT_URL في البيئة بنسمح بيها بس (+ localhost للتطوير)،
// وإلا بنسمح للكل (عشان منكسرش النشر الحالي لحد ما تضبطيها).
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.length === 0) return cb(null, true);
      const ok =
        allowedOrigins.includes(origin) || /localhost(:\d+)?$/.test(origin);
      return cb(null, ok);
    },
  })
);

app.use(express.json({ limit: "10mb" })); // 10mb عشان رفع الصور base64
app.use(express.urlencoded({ extended: true }));

// تحديد معدّل الطلبات على مسارات تسجيل الدخول/التسجيل (مكافحة brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 50, // 50 محاولة لكل IP في النافذة
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// مهم للـ serverless: نتأكد إن الاتصال بالداتابيز كمّل قبل أي طلب
// (من غير كده الكويري بيتعمله buffering وبيـ timeout على Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Amazon App API is running 🚀" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
