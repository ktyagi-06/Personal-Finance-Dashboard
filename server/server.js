import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import txRoutes from "./routes/transactions.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ===== ROUTES ===== */
app.use("/api/auth", authRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/ai", aiRoutes);

/* ===== TEST ROUTE ===== */
app.get("/test", (req, res) => res.send("OK"));

/* ===== START SERVER AFTER DB CONNECT ===== */
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Mongo connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running");
    });
  })
  .catch(err => {
    console.error("Mongo error:", err);
  });