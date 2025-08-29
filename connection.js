import mongoose from "mongoose";

export default async function connection() {
  try {
    // Build the MongoDB URI properly
    const uri = `${process.env.DB_URL}${process.env.DB_NAME}?retryWrites=true&w=majority`;

    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Database connected");
    return db;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Stop server if DB connection fails
  }
}
