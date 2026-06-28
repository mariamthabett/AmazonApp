// ============================================================
//  ملف مرجعي فقط (NOT used by the app) — انسخي منه جوّه Product.js
//  الحقول: صورة المنتج، اسمه، الوصف، السعر، النوع، الكمية (in stock)،
//          الـ rate، والمراجعات (reviews + numReviews)
// ============================================================

const mongoose = require("mongoose");

// المراجعات بتتخزّن جوّه المنتج نفسه (نفس مسار POST /api/products/:id/reviews)
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // اسم المنتج
    title: { type: String, required: true, trim: true },

    // الوصف
    description: { type: String, default: "" },

    // السعر
    price: { type: Number, required: true, default: 0 },

    // صورة المنتج (رابط الصورة)
    image: { type: String, default: "" },

    // النوع / التصنيف — مربوط بكولكشن Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // الكمية المتوفرة (in stock)
    stock: { type: Number, required: true, default: 0 },

    // المراجعات (مصفوفة من reviewSchema فوق)
    reviews: [reviewSchema],

    // التقييم (rate) من 0 لـ 5 — بيتحسب كمتوسط المراجعات
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // عدد المراجعات
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

// ------------------------------------------------------------
//  ملاحظات:
//  • لو هتنسخي البلوك ده كامل جوّه Product.js هيبقى نفس الموجود حاليًا
//    بالظبط — يبقى مفيش حاجة تتكسر.
//
//  • "النوع" مربوط بـ Category زي الـ ERD. لو عايزاه نص عادي:
//        category: { type: String, required: true },
//
//  • reviewSchema لازم يتكتب فوق productSchema (زي هنا) عشان
//    productSchema بيستخدمه في حقل reviews.
// ------------------------------------------------------------
