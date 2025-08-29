import mongoose from "mongoose";

export default async function connection() {
  try {
    await mongoose.connect(process.env.DB_URL); // full URL in .env
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}
