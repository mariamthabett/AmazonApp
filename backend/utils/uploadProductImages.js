// يولّد صورة مناسبة لكل منتج، يرفعها على Cloudinary بتاع المستخدم،
// ويخزّن رابط Cloudinary الدائم في المنتج. كده الصور بتبقى سريعة وموثوقة ومش بتختفي.
// التشغيل: node utils/uploadProductImages.js
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const { CATALOG } = require("./fakeProducts");

// أسماء المتغيّرات في .env فيها typo (cloiudinary) — بندعم الاتنين.
const CLOUD_NAME =
  process.env.cloiudinary_cloud_name || process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY =
  process.env.cloiudinary_api_key || process.env.CLOUDINARY_API_KEY;
const API_SECRET =
  process.env.cloiudinary_api_secret || process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// مصدر الصورة: مولّد صور بـ prompt واضح عشان الصورة تبقى متعلّقة بالمنتج
const sourceImage = (item, seed) => {
  const prompt = `${item.title}, ${item.img}, isolated product photo, plain white background, studio lighting, high detail, e-commerce catalog`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt
  )}?width=600&height=600&seed=${seed}&nologo=true&model=flux`;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// نجيب بايتات الصورة من المصدر مع إعادة المحاولة + backoff.
// المولّد بيرجّع 429 لو زوّدنا الطلبات بسرعة، فبنستنى أطول في الحالة دي.
async function fetchImage(url, tries = 6) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 60000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) {
        const err = new Error("HTTP " + res.status);
        err.status = res.status;
        throw err;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error("image too small");
      return buf;
    } catch (e) {
      if (attempt === tries) throw e;
      // backoff أطول بكتير لو rate limit (429)
      const base = e.status === 429 ? 5000 : 1500;
      await sleep(base * attempt);
    }
  }
}

// نرفع منتج واحد: نتخطّاه لو متعمل خلاص، وإلا نجيب الصورة ونرفعها ونحدّث المنتج
async function processItem(item, seed) {
  // لو المنتج عنده صورة Cloudinary خلاص → نتخطّاه (تشغيل idempotent + أسرع)
  const existing = await Product.findOne({ title: item.title }, "image");
  if (existing && /res\.cloudinary\.com/.test(existing.image || "")) {
    return { title: item.title, skipped: true };
  }

  const buf = await fetchImage(sourceImage(item, seed));
  const dataUri = `data:image/jpeg;base64,${buf.toString("base64")}`;

  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: "amazonapp/products",
    public_id: slugify(item.title),
    overwrite: true,
    resource_type: "image",
    transformation: [{ width: 600, height: 600, crop: "fill", quality: "auto" }],
  });

  const res = await Product.updateOne(
    { title: item.title },
    { $set: { image: uploaded.secure_url } }
  );
  return { title: item.title, url: uploaded.secure_url, matched: res.matchedCount };
}

// تشغيل بالتسلسل (واحد ورا التاني) مع وقفة بسيطة بينهم عشان منوصلش لحد الـ rate limit
async function runSequential(tasks, gapMs = 2000) {
  const results = [];
  for (let i = 0; i < tasks.length; i++) {
    try {
      const r = { ok: true, ...(await tasks[i]()) };
      results.push(r);
      console.log(`  ${r.skipped ? "•" : "✓"} ${r.title}${r.skipped ? " (already done)" : ""}`);
    } catch (e) {
      results.push({ ok: false, title: tasks[i].title, error: e.message });
      console.log(`  ✗ ${tasks[i].title} — ${e.message}`);
    }
    if (i < tasks.length - 1) await sleep(gapMs);
  }
  return results;
}

(async () => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.error("❌ Cloudinary credentials missing in .env");
    process.exit(1);
  }

  await connectDB();
  console.log(`☁️  Uploading product images to Cloudinary cloud "${CLOUD_NAME}"...`);

  // نبني قائمة المهام (كل منتج = دالة) بنفس ترتيب الـ seed
  const tasks = [];
  let seed = 0;
  for (const items of Object.values(CATALOG)) {
    for (const item of items) {
      seed += 1;
      const s = seed;
      const fn = () => processItem(item, s);
      fn.title = item.title;
      tasks.push(fn);
    }
  }

  const results = await runSequential(tasks, 2000);
  const uploaded = results.filter((r) => r.ok && !r.skipped);
  const skipped = results.filter((r) => r.ok && r.skipped);
  const failed = results.filter((r) => !r.ok);

  console.log(
    `\n✅ Done. uploaded ${uploaded.length}, already-done ${skipped.length}, failed ${failed.length} (of ${results.length}).`
  );
  if (failed.length) {
    console.log("⚠️  Failed:", failed.map((f) => f.title).join(", "));
  }

  await mongoose.connection.close();
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(`❌ ${e.message}`);
  process.exit(1);
});
