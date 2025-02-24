import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
console.log("MONGODB_URL:", process.env.MONGO_URI);  // ✅ Debugging line


export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};
