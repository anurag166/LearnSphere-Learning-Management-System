/**
 * Creates (or promotes) an Admin account.
 *
 * Admin accounts are intentionally NOT self-serve via the public Signup page
 * (only Student/Instructor are offered there), so this script is the
 * supported way to get your first Admin user.
 *
 * Usage:
 *   cd server
 *   node scripts/createAdmin.js "admin@example.com" "SomeStrongPassword123" "First" "Last"
 *
 * If a user with that email already exists, it will simply be promoted to
 * accountType "Admin" (password left untouched). Otherwise a brand new
 * Admin user + profile is created.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../config/database.js";
import { User } from "../src/models/user.model.js";
import { profile } from "../src/models/profile.model.js";

dotenv.config();

async function main() {
  const [, , email, password, firstName = "Admin", lastName = "User"] = process.argv;

  if (!email || !password) {
    console.error(
      'Usage: node scripts/createAdmin.js "admin@example.com" "StrongPassword123" "First" "Last"'
    );
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    existing.accountType = "Admin";
    await existing.save();
    console.log(`✅ Promoted existing user "${email}" to Admin.`);
  } else {
    const profileDetails = await profile.create({
      gender: "Prefer not to say",
      dob: "01-01-2000",
      about: "Platform Administrator",
      contactNumber: "0000000000",
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      accountType: "Admin",
      additionalDetails: profileDetails._id,
      profileImage: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    console.log(`✅ Created new Admin user "${email}".`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to create/promote admin:", err);
  process.exit(1);
});
