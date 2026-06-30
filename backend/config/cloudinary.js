// إعداد Cloudinary من متغيّرات البيئة.
// ملاحظة: أسماء المتغيّرات في .env فيها typo (cloiudinary) — بندعم الاتنين.
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name:
    process.env.cloiudinary_cloud_name || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.cloiudinary_api_key || process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.cloiudinary_api_secret || process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
