// دوال مساعدة للعرض (سعر، صورة بديلة)

// تنسيق السعر بالجنيه المصري. مثال: 1200 -> "1,200 ج.م" أو "EGP 1,200"
export function formatPrice(value, lang = "ar") {
  const n = Number(value || 0);
  const formatted = n.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0,
  });
  return lang === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}

// صورة بديلة لو المنتج مالوش صورة أو الصورة وقعت
export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='100%' height='100%' fill='#eaeded'/>
      <text x='50%' y='50%' fill='#9ca3af' font-family='sans-serif' font-size='20'
        text-anchor='middle' dominant-baseline='middle'>No image</text>
    </svg>`
  );

// نستخدمها على عنصر <img>: onError={onImgError}
// لو الصورة فشلت: نعيد المحاولة مرة واحدة (مفيد لو مولّد الصور اتأخر/رجّع خطأ مؤقت)،
// وبعدين نعرض صورة بديلة بدل ما يفضل فاضي.
export function onImgError(e) {
  const img = e.currentTarget;
  const src = img.src || "";

  // متعملتش retry قبل كده، والصورة مش هي البديلة نفسها؟ نجرّب تاني مرة واحدة.
  if (!img.dataset.retried && src && !src.startsWith("data:")) {
    img.dataset.retried = "1";
    const sep = src.includes("?") ? "&" : "?";
    img.src = src.split("#")[0] + sep + "_retry=1";
    return;
  }

  // فشلت المحاولة كمان → صورة بديلة نهائية
  img.onerror = null;
  img.src = FALLBACK_IMAGE;
}
