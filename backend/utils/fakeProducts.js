// ============================================================
//  مولّد منتجات وهمية (fake) للـ seed
//  بيرجّع مصفوفة منتجات جاهزة للـ Product.insertMany
//  بياخد: map للتصنيفات (byName) + اليوزرز عشان نربط الريفيوز
// ============================================================

// كتالوج ثابت لكل تصنيف: العنوان + الوصف + السعر + كلمة مفتاحية للصورة (img)
// الصورة بتتجاب من loremflickr حسب الكلمة المفتاحية عشان تبقى مناسبة للمنتج.
const CATALOG = {
  Electronics: [
    { title: "Wireless Headphones", price: 1200, img: "headphones", description: "Noise-cancelling over-ear headphones with 30h battery life." },
    { title: "Bluetooth Speaker", price: 850, img: "speaker", description: "Portable waterproof speaker with deep bass and 12h playtime." },
    { title: "Smart Watch", price: 2200, img: "smartwatch", description: "Fitness tracking, heart-rate monitor and phone notifications." },
    { title: "4K Action Camera", price: 3100, img: "actioncamera", description: "Waterproof 4K camera with image stabilization and accessories." },
    { title: "Gaming Mouse", price: 600, img: "gaming,mouse", description: "Ergonomic RGB mouse with 16000 DPI optical sensor." },
    { title: "Mechanical Keyboard", price: 1450, img: "keyboard", description: "Hot-swappable mechanical keyboard with tactile brown switches." },
    { title: "USB-C Fast Charger", price: 320, img: "charger", description: "65W GaN charger that powers laptops and phones quickly." },
    { title: "Noise-Cancelling Earbuds", price: 1750, img: "earbuds", description: "True wireless earbuds with active noise cancellation." },
    { title: "Portable Power Bank", price: 540, img: "powerbank", description: "20000mAh power bank with dual USB-C fast charging." },
    { title: "1080p Webcam", price: 780, img: "webcam", description: "Full HD webcam with auto-focus and built-in microphone." },
    { title: "Smart LED Bulb", price: 230, img: "lightbulb", description: "Color-changing Wi-Fi bulb controllable from your phone." },
    { title: "Wireless Charger Pad", price: 410, img: "wireless,charger", description: "15W fast wireless charging pad for phones and earbuds." },
  ],
  Books: [
    { title: "The Pragmatic Programmer", price: 450, img: "book", description: "Classic software engineering book on writing better code." },
    { title: "Clean Code", price: 480, img: "books", description: "A handbook of agile software craftsmanship by Robert C. Martin." },
    { title: "Atomic Habits", price: 380, img: "book,reading", description: "An easy and proven way to build good habits and break bad ones." },
    { title: "Deep Work", price: 350, img: "book,desk", description: "Rules for focused success in a distracted world." },
    { title: "The Lean Startup", price: 420, img: "book,office", description: "How constant innovation creates radically successful businesses." },
    { title: "Sapiens", price: 520, img: "book,library", description: "A brief history of humankind by Yuval Noah Harari." },
    { title: "Rich Dad Poor Dad", price: 300, img: "book,money", description: "What the rich teach their kids about money." },
    { title: "The Alchemist", price: 260, img: "book,novel", description: "A magical fable about following your dream by Paulo Coelho." },
    { title: "Thinking, Fast and Slow", price: 540, img: "book,reading", description: "The two systems that drive the way we think, by Daniel Kahneman." },
    { title: "Educated", price: 410, img: "books,shelf", description: "A memoir about the transformative power of education." },
  ],
  Fashion: [
    { title: "Cotton T-Shirt", price: 250, img: "tshirt", description: "Comfortable everyday crew-neck t-shirt, 100% cotton." },
    { title: "Slim Fit Jeans", price: 690, img: "jeans", description: "Stretch denim slim-fit jeans for a modern look." },
    { title: "Running Sneakers", price: 1300, img: "sneakers", description: "Lightweight breathable sneakers with cushioned soles." },
    { title: "Leather Wallet", price: 420, img: "wallet", description: "Genuine leather bifold wallet with RFID protection." },
    { title: "Hooded Sweatshirt", price: 580, img: "hoodie", description: "Soft fleece-lined hoodie, perfect for cooler days." },
    { title: "Classic Sunglasses", price: 360, img: "sunglasses", description: "UV400 polarized sunglasses with a timeless frame." },
    { title: "Wool Beanie", price: 190, img: "beanie", description: "Warm knitted beanie for winter, one size fits all." },
    { title: "Canvas Backpack", price: 740, img: "backpack", description: "Durable canvas backpack with a padded laptop sleeve." },
    { title: "Analog Wrist Watch", price: 980, img: "watch", description: "Minimalist analog watch with a stainless steel strap." },
    { title: "Cotton Socks (5-Pack)", price: 150, img: "socks", description: "Breathable cotton ankle socks, pack of five pairs." },
  ],
  Home: [
    { title: "Coffee Maker", price: 1800, img: "coffeemaker", description: "Programmable drip coffee maker that brews up to 12 cups." },
    { title: "Non-Stick Frying Pan", price: 470, img: "fryingpan", description: "28cm non-stick frying pan safe for all stovetops." },
    { title: "Memory Foam Pillow", price: 530, img: "pillow", description: "Ergonomic memory foam pillow with a cooling cover." },
    { title: "Scented Candle Set", price: 290, img: "candle", description: "Set of three long-burning soy candles with natural scents." },
    { title: "Stainless Steel Water Bottle", price: 340, img: "waterbottle", description: "Insulated bottle that keeps drinks cold for 24 hours." },
    { title: "Ceramic Dinner Set", price: 1250, img: "dinnerware", description: "16-piece ceramic dinnerware set for four people." },
    { title: "Robot Vacuum Cleaner", price: 4200, img: "vacuum", description: "Smart robot vacuum with app control and auto-charging." },
    { title: "Cotton Bath Towels", price: 620, img: "towels", description: "Set of four soft and absorbent 100% cotton towels." },
    { title: "Desk Lamp with USB", price: 410, img: "desklamp", description: "Dimmable LED desk lamp with a built-in USB charging port." },
    { title: "Air Purifier", price: 2600, img: "airpurifier", description: "HEPA air purifier for rooms up to 40 square meters." },
  ],
};

// رابط صورة مناسبة للمنتج حسب الكلمة المفتاحية (loremflickr بيرجّع صورة حقيقية للكلمة).
// lock = رقم ثابت عشان نفس المنتج يرجّع نفس الصورة كل مرة بدل ما تتغيّر.
function buildImageUrl(item, lockSeed) {
  return `https://loremflickr.com/600/600/${item.img}?lock=${lockSeed}`;
}

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
        image: buildImageUrl(item, i), // صورة مناسبة للمنتج (lock=i عشان تثبت)
        category: categoryId,
        reviews,
        rating,
        numReviews,
      });
    }
  }

  return products;
}

module.exports = { generateProducts, buildImageUrl, CATALOG };
