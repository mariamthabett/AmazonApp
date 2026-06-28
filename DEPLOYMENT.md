# 🚀 دليل النشر على Vercel

التطبيق بجزئين، فهننشر **مشروعين على Vercel** (الاتنين تحت حسابك):
- **Backend** (سيرفر Express كـ serverless) — من فولدر `backend`
- **Frontend** (React/Vite) — من فولدر `frontend`

الكود موجود على GitHub: `https://github.com/mariamthabett/AmazonApp`

---

## الخطوة 0 — MongoDB Atlas (مهمة جدًا) 🔑

عشان السيرفر المنشور يقدر يوصل للداتابيز:
1. ادخلي [cloud.mongodb.com](https://cloud.mongodb.com) → الـ Cluster بتاعك
2. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → Confirm
3. (لو لسه) املأي الداتابيز بالبيانات التجريبية: من جهازك `cd backend && npm run seed`

---

## الخطوة 1 — نشر الـ Backend

1. ادخلي [vercel.com](https://vercel.com) وسجّلي دخول بـ GitHub.
2. **Add New… → Project** → اختاري ريبو **AmazonApp** → **Import**.
3. في صفحة الإعداد:
   - **Root Directory:** اضغطي **Edit** واختاري فولدر **`backend`** ✅ (مهم جدًا)
   - **Framework Preset:** سيبيه **Other**
4. افتحي **Environment Variables** وضيفي:
   | Name | Value |
   |------|-------|
   | `MONGO_URI` | (نفس اللي في `backend/.env`) |
   | `JWT_SECRET` | أي نص طويل عشوائي |
   | `JWT_EXPIRES_IN` | `7d` |
5. **Deploy**. بعد ما يخلص هياخد رابط زي `https://amazonapp-backend.vercel.app`.
6. اتأكدي إنه شغّال: افتحي الرابط في المتصفح → لازم تشوفي
   `{"message":"Amazon App API is running 🚀"}`.

> **انسخي رابط الـ backend** — هنحتاجه في الخطوة الجاية.

---

## الخطوة 2 — نشر الـ Frontend

1. في Vercel تاني: **Add New… → Project** → نفس ريبو **AmazonApp** → **Import**.
2. في صفحة الإعداد:
   - **Root Directory:** اختاري فولدر **`frontend`** ✅
   - **Framework Preset:** المفروض يكتشف **Vite** تلقائيًا
3. افتحي **Environment Variables** وضيفي:
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | رابط الـ backend من الخطوة 1 **+ `/api`** |

   مثال: `https://amazonapp-backend.vercel.app/api`
4. **Deploy**. هياخد رابط زي `https://amazonapp.vercel.app` — **ده لينك موقعك** 🎉

---

## الخطوة 3 — التجربة

1. افتحي رابط الـ frontend.
2. روحي `/register` واعملي حساب، أو `/login` بـ `customer@example.com / 123456`.
3. لو الدخول اشتغل → كله تمام ✅

---

## لو حصلت مشكلة 🛠️

- **الواجهة بتفتح بس الدخول/التسجيل بيدّي خطأ شبكة:** غالبًا `VITE_API_URL` غلط أو ناقص `/api`.
  بعد أي تعديل على Environment Variables لازم تعملي **Redeploy** لمشروع الواجهة.
- **السيرفر بيدّي خطأ اتصال بالداتابيز:** اتأكدي من Atlas whitelist (`0.0.0.0/0`) ومن `MONGO_URI`.
- **صفحة فاضية بعد refresh على مسار زي `/login`:** متأكدة إن `frontend/vercel.json` موجود (بيعمل
  SPA rewrites) — وهو موجود فعلًا في الريبو.

---

## ملاحظة عن التحديثات
أي تعديل بيتدفع على GitHub (branch `main`) → Vercel بيعيد النشر تلقائيًا للمشروعين. مفيش حاجة يدوية.
