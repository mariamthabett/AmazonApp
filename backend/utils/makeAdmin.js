// Promote an existing user to admin (without wiping any data).
// Usage:  node utils/makeAdmin.js your-email@example.com
require("dotenv").config();
const connectDB = require("../config/db");
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
  const email = (process.argv[2] || "").trim().toLowerCase();
  if (!email) {
    console.error("❌ Please pass an email:  node utils/makeAdmin.js you@example.com");
    process.exit(1);
  }

  try {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`ℹ️  ${email} is already an admin.`);
      process.exit(0);
    }

    user.role = "admin";
    await user.save();
    console.log(`✅ ${email} is now an admin. Log out and back in to see the Admin tab.`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

run();
