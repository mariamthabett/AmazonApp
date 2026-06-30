// تحديث صور المنتجات الموجودة بالفعل لصور مناسبة، من غير ما نمسح أي داتا تانية.
// التشغيل: node utils/updateImages.js
require("dotenv").config();
const connectDB = require("../config/db");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { CATALOG, buildImageUrl } = require("./fakeProducts");

(async () => {
  try {
    await connectDB();

    // نبني خريطة: عنوان المنتج -> رابط الصورة المناسبة (نفس ترتيب الـ seed)
    const titleToImage = {};
    let i = 0;
    for (const items of Object.values(CATALOG)) {
      for (const item of items) {
        i += 1;
        titleToImage[item.title] = buildImageUrl(item, i);
      }
    }

    let updated = 0;
    let skipped = 0;
    for (const [title, image] of Object.entries(titleToImage)) {
      const res = await Product.updateOne({ title }, { $set: { image } });
      if (res.matchedCount > 0) updated += 1;
      else skipped += 1;
    }

    console.log(`✅ Updated images for ${updated} products (${skipped} not found).`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
})();
