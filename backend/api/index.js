// نقطة الدخول للـ serverless على Vercel.
// بتصدّر تطبيق Express جاهز (من غير listen) عشان Vercel يلفّه كـ serverless function.
module.exports = require("../app");
