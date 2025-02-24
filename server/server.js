import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";


import { connectMongoDB } from "./lib/db.js";  // ✅ Correct Import

  // Call the function to connect to MongoDB

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 2026;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.json({ message: "Hi, This is Fusion Mart server!" });
});

app.listen(PORT, () => {
  connectMongoDB();
 
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
