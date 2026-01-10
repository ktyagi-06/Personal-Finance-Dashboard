import express from "express";
import {
  getTransactions,
  createTransaction,
} from "../controllers/transactionController.js";

import { getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", getTransactions);
router.post("/", createTransaction);

// 🔥 NEW ANALYTICS ROUTE
router.get("/analytics", getAnalytics);

export default router;
