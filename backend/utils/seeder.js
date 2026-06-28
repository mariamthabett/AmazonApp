// Seed script: run `node utils/seeder.js` to import demo data,
// or `node utils/seeder.js -d` to wipe everything.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");

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
    await User.create({
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

    // Products
    const products = [
      {
        title: "Wireless Headphones",
        description: "Noise-cancelling over-ear headphones.",
        price: 1200,
        stock: 25,
        image: "https://picsum.photos/seed/headphones/400",
        category: byName["Electronics"],
      },
      {
        title: "Smart Watch",
        description: "Fitness tracking and notifications.",
        price: 2200,
        stock: 15,
        image: "https://picsum.photos/seed/watch/400",
        category: byName["Electronics"],
      },
      {
        title: "The Pragmatic Programmer",
        description: "Classic software engineering book.",
        price: 450,
        stock: 40,
        image: "https://picsum.photos/seed/book/400",
        category: byName["Books"],
      },
      {
        title: "Cotton T-Shirt",
        description: "Comfortable everyday t-shirt.",
        price: 250,
        stock: 100,
        image: "https://picsum.photos/seed/tshirt/400",
        category: byName["Fashion"],
      },
      {
        title: "Coffee Maker",
        description: "Brew fresh coffee at home.",
        price: 1800,
        stock: 10,
        image: "https://picsum.photos/seed/coffee/400",
        category: byName["Home"],
      },
    ];
    await Product.insertMany(products);

    console.log("✅ Data imported!");
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
