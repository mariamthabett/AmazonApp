// Seed script: run `node utils/seeder.js` to import demo data,
// or `node utils/seeder.js -d` to wipe everything.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { generateProducts } = require("./fakeProducts");

const categories = [
  { name: "Electronics", image: "" },
  { name: "Books", image: "" },
  { name: "Fashion", image: "" },
  { name: "Home", image: "" },
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    // Admin + demo customer
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "123456",
      role: "admin",
      phoneNumber: "01000000000",
    });
    const customer = await User.create({
      firstName: "Demo",
      lastName: "Customer",
      email: "customer@example.com",
      password: "123456",
      role: "customer",
      phoneNumber: "01011111111",
    });

    // Categories
    const createdCategories = await Category.insertMany(categories);
    const byName = {};
    createdCategories.forEach((c) => (byName[c.name] = c._id));

    // Products — منتجات وهمية مولّدة تلقائيًا لكل تصنيف (مع ريفيوز)
    const products = generateProducts(byName, [admin, customer]);
    await Product.insertMany(products);

    console.log(`✅ Data imported! (${products.length} products)`);
    console.log("   Admin login    -> admin@example.com / 123456");
    console.log("   Customer login -> customer@example.com / 123456");
    process.exit(0);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    console.log("🗑️  Data destroyed!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
