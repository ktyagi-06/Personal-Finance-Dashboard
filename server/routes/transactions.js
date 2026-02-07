import express from "express";
import Transaction from "../models/Transaction.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ===== GET ===== */
router.get("/", auth, async (req,res)=>{
  const data = await Transaction
    .find({ userId:req.userId })
    .sort({ date:-1 });

  res.json(data);
});

/* ===== ADD ===== */
router.post("/", auth, async (req,res)=>{
  const t = await Transaction.create({
    ...req.body,
    userId:req.userId
  });
  res.json(t);
});

/* ===== DELETE ===== */
router.delete("/:id", auth, async (req,res)=>{
  await Transaction.findOneAndDelete({
    _id:req.params.id,
    userId:req.userId
  });
  res.json({msg:"Deleted"});
});

/* ===== ANALYTICS ===== */
router.get("/analytics", auth, async (req,res)=>{
  const tx = await Transaction.find({ userId:req.userId });

  const income = tx
    .filter(t=>t.type==="income")
    .reduce((a,b)=>a+b.amount,0);

  const expense = tx
    .filter(t=>t.type==="expense")
    .reduce((a,b)=>a+b.amount,0);

  const categoryTotals = {};
  tx.filter(t=>t.type==="expense").forEach(t=>{
    categoryTotals[t.category] =
      (categoryTotals[t.category]||0)+t.amount;
  });

  const expenseTrend =
    tx.filter(t=>t.type==="expense")
      .sort((a,b)=>new Date(a.date)-new Date(b.date));

  const monthlyExpenses = {};
  tx.filter(t=>t.type==="expense").forEach(t=>{
    const m = new Date(t.date)
      .toLocaleString("default",{month:"short"});
    monthlyExpenses[m] =
      (monthlyExpenses[m]||0)+t.amount;
  });

  res.json({
    income,
    expense,
    categoryTotals,
    expenseTrend,
    monthlyExpenses
  });
});

export default router;