import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  type: String,       // income | expense
  date: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

export default mongoose.model("Transaction", transactionSchema);