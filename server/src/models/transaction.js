import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🔥 THIS LINE IS CRITICAL
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;

