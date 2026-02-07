import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import txRoutes from "./routes/transactions.js";
import aiRoutes from "./routes/ai.js";
dotenv.config();

/* ===== CREATE APP FIRST ===== */
const app = express();

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

/* ===== ROUTES ===== */
app.use("/api/auth", authRoutes);
app.use("/api/transactions", txRoutes);

/* ===== TEST ROUTE ===== */
app.get("/test", (req,res)=>res.send("OK"));

/* ===== DB ===== */
console.log("ENV MONGO:", process.env.MONGO_URL);

await mongoose.connect(process.env.MONGO_URL);
console.log("Mongo connected");

/* ===== START ===== */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.use("/api/ai", aiRoutes);