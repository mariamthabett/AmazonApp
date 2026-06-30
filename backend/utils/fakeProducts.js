// ============================================================
//  مولّد منتجات وهمية (fake) للـ seed
//  بيرجّع مصفوفة منتجات جاهزة للـ Product.insertMany
//  بياخد: map للتصنيفات (byName) + اليوزرز عشان نربط الريفيوز
// ============================================================

// كتالوج ثابت لكل تصنيف: العنوان + الوصف + السعر الأساسي
const CATALOG = {
  Electronics: [
    { title: "Wireless Headphones", price: 1200, description: "Noise-cancelling over-ear headphones with 30h battery life." },
    { title: "Bluetooth Speaker", price: 850, description: "Portable waterproof speaker with deep bass and 12h playtime." },
    { title: "Smart Watch", price: 2200, description: "Fitness tracking, heart-rate monitor and phone notifications." },
    { title: "4K Action Camera", price: 3100, description: "Waterproof 4K camera with image stabilization and accessories." },
    { title: "Gaming Mouse", price: 600, description: "Ergonomic RGB mouse with 16000 DPI optical sensor." },
    { title: "Mechanical Keyboard", price: 1450, description: "Hot-swappable mechanical keyboard with tactile brown switches." },
    { title: "USB-C Fast Charger", price: 320, description: "65W GaN charger that powers laptops and phones quickly." },
    { title: "Noise-Cancelling Earbuds", price: 1750, description: "True wireless earbuds with active noise cancellation." },
    { title: "Portable Power Bank", price: 540, description: "20000mAh power bank with dual USB-C fast charging." },
    { title: "1080p Webcam", price: 780, description: "Full HD webcam with auto-focus and built-in microphone." },
    { title: "Smart LED Bulb", price: 230, description: "Color-changing Wi-Fi bulb controllable from your phone." },
    { title: "Wireless Charger Pad", price: 410, description: "15W fast wireless charging pad for phones and earbuds." },
  ],
  Books: [
    { title: "The Pragmatic Programmer", price: 450, description: "Classic software engineering book on writing better code." },
    { title: "Clean Code", price: 480, description: "A handbook of agile software craftsmanship by Robert C. Martin." },
    { title: "Atomic Habits", price: 380, description: "An easy and proven way to build good habits and break bad ones." },
    { title: "Deep Work", price: 350, description: "Rules for focused success in a distracted world." },
    { title: "The Lean Startup", price: 420, description: "How constant innovation creates radically successful businesses." },
    { title: "Sapiens", price: 520, description: "A brief history of humankind by Yuval Noah Harari." },
    { title: "Rich Dad Poor Dad", price: 300, description: "What the rich teach their kids about money." },
    { title: "The Alchemist", price: 260, description: "A magical fable about following your dream by Paulo Coelho." },
    { title: "Thinking, Fast and Slow", price: 540, description: "The two systems that drive the way we think, by Daniel Kahneman." },
    { title: "Educated", price: 410, description: "A memoir about the transformative power of education." },
  ],
  Fashion: [
    { title: "Cotton T-Shirt", price: 250, description: "Comfortable everyday crew-neck t-shirt, 100% cotton." },
    { title: "Slim Fit Jeans", price: 690, description: "Stretch denim slim-fit jeans for a modern look." },
    { title: "Running Sneakers", price: 1300, description: "Lightweight breathable sneakers with cushioned soles." },
    { title: "Leather Wallet", price: 420, description: "Genuine leather bifold wallet with RFID protection." },
    { title: "Hooded Sweatshirt", price: 580, description: "Soft fleece-lined hoodie, perfect for cooler days." },
    { title: "Classic Sunglasses", price: 360, description: "UV400 polarized sunglasses with a timeless frame." },
    { title: "Wool Beanie", price: 190, description: "Warm knitted beanie for winter, one size fits all." },
    { title: "Canvas Backpack", price: 740, description: "Durable canvas backpack with a padded laptop sleeve." },
    { title: "Analog Wrist Watch", price: 980, description: "Minimalist analog watch with a stainless steel strap." },
    { title: "Cotton Socks (5-Pack)", price: 150, description: "Breathable cotton ankle socks, pack of five pairs." },
  ],
  Home: [
    { title: "Coffee Maker", price: 1800, description: "Programmable drip coffee maker that brews up to 12 cups." },
    { title: "Non-Stick Frying Pan", price: 470, description: "28cm non-stick frying pan safe for all stovetops." },
    { title: "Memory Foam Pillow", price: 530, description: "Ergonomic memory foam pillow with a cooling cover." },
    { title: "Scented Candle Set", price: 290, description: "Set of three long-burning soy candles with natural scents." },
    { title: "Stainless Steel Water Bottle", price: 340, description: "Insulated bottle that keeps drinks cold for 24 hours." },
    { title: "Ceramic Dinner Set", price: 1250, description: "16-piece ceramic dinnerware set for four people." },
    { title: "Robot Vacuum Cleaner", price: 4200, description: "Smart robot vacuum with app control and auto-charging." },
    { title: "Cotton Bath Towels", price: 620, description: "Set of four soft and absorbent 100% cotton towels." },
    { title: "Desk Lamp with USB", price: 410, description: "Dimmable LED desk lamp with a built-in USB charging port." },
    { title: "Air Purifier", price: 2600, description: "HEPA air purifier for rooms up to 40 square meters." },
  ],
};

// عبارات جاهزة للريفيوز
const REVIEW_COMMENTS = [
  "Great quality, highly recommend!",
  "Exactly as described, fast delivery.",
  "Good value for the price.",
  "Works perfectly, very happy with it.",
  "Decent product but could be better.",
  "Loved it, would buy again.",
  "Solid build and easy to use.",
  "Met my expectations.",
];

// RNG بسيط ثابت (seeded) عشان النتيجة تبقى نفسها كل مرة نعمل seed
function makeRng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * بيولّد مصفوفة منتجات وهمية جاهزة للحفظ.
 * @param {Object} byName  - map من اسم التصنيف لـ ObjectId بتاعه
 * @param {Array}  users   - يوزرز متسيّفين (عشان نربطهم بالريفيوز)
 * @returns {Array} products
 */
function generateProducts(byName, users = []) {
  const products = [];
  let i = 0;

  for (const [categoryName, items] of Object.entries(CATALOG)) {
    const categoryId = byName[categoryName];
    if (!categoryId) continue; // التصنيف مش موجود؟ نتخطاه

    for (const item of items) {
      i += 1;
      const rng = makeRng(i * 97 + categoryName.length);
      const slug = slugify(item.title);

      // عدد ريفيوز عشوائي (0..3) لو فيه يوزرز
      const numReviews = users.length ? Math.floor(rng() * 4) : 0;
      const reviews = [];
      let ratingSum = 0;
      for (let r = 0; r < numReviews; r++) {
        const user = users[Math.floor(rng() * users.length)];
        const rating = 3 + Math.floor(rng() * 3); // 3..5
        ratingSum += rating;
        reviews.push({
          user: user._id,
          name: user.name || `${user.firstName} ${user.lastName}`,
          rating,
          comment: REVIEW_COMMENTS[Math.floor(rng() * REVIEW_COMMENTS.length)],
        });
      }

      const rating = numReviews
        ? Math.round((ratingSum / numReviews) * 10) / 10
        : 0;

      products.push({
        title: item.title,
        description: item.description,
        price: item.price,
        stock: 5 + Math.floor(rng() * 96), // 5..100
        image: `https://picsum.photos/seed/${slug}/400/400`,
        category: categoryId,
        reviews,
        rating,
        numReviews,
      });
    }
  }

  return products;
}

module.exports = { generateProducts, CATALOG };
