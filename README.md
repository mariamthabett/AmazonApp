# 🏪 AmazonApp — Amazon Clone (E-commerce)

متجر إلكتروني مبسّط (Amazon Clone) مبني بـ **MERN Stack**.

## 🧱 الـ Stack

- **Backend:** Node.js + Express (نمط MVC: Routes / Controllers / Models)
- **Database:** MongoDB (Mongoose)
- **Frontend:** React _(قريباً)_

## 📁 هيكل المشروع

```
AmazonApp/
└── backend/
    ├── config/        # الاتصال بقاعدة البيانات
    ├── models/        # سكيمات Mongoose
    ├── controllers/   # المنطق (Logic)
    ├── routes/        # مسارات الـ API
    ├── middleware/    # auth + معالجة الأخطاء
    ├── utils/         # أدوات مساعدة (token / seeder)
    └── index.js       # نقطة بداية السيرفر
```

## ▶️ التشغيل

```bash
cd backend
npm install
npm run dev
```

> قبل التشغيل: انسخ `.env.example` باسم `.env` واملا قيم `MONGO_URI` و `JWT_SECRET`.

## 📋 الـ API

| المجموعة | المسار | الوظيفة |
|---|---|---|
| Auth | `/api/auth/...` | تسجيل / دخول |
| Products | `/api/products/...` | المنتجات + بحث/فلترة |
| Categories | `/api/categories/...` | التصنيفات |
| Orders | `/api/orders/...` | الطلبات |
