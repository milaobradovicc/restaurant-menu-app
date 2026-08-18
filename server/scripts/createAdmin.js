const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
require("dotenv").config();

async function createAdmin() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  if (!process.env.MONGO_URI || !email || password.length < 12) {
    throw new Error("Set MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters).");
  }
  await mongoose.connect(process.env.MONGO_URI);
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate({ email }, { password: hashedPassword }, { upsert: true, runValidators: true });
  await mongoose.disconnect();
  console.log("Admin account is ready.");
}

createAdmin().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
