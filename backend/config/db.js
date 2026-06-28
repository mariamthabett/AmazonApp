const mongoose = require("mongoose");

// نخزّن الاتصال في الـ global عشان على الـ serverless (Vercel) كل طلب ممكن
// يشغّل نسخة جديدة — فبنعيد استخدام نفس الاتصال بدل ما نفتح واحد جديد كل مرة.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  // اتصال جاهز؟ نرجّعه على طول
  if (cached.conn) return cached.conn;

  // مفيش محاولة اتصال شغّالة؟ نبدأ واحدة
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => {
      console.log(`MongoDB Connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // نسمح بإعادة المحاولة في الطلب الجاي
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
