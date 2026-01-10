import Transaction from "../models/Transaction.js";

export const getAnalytics = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let income = 0;
    let expense = 0;
    const categoryTotals = {};
    const monthlyExpenses = {};

    transactions.forEach((t) => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;

        // category totals
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount;

        // monthly totals
        const month = new Date(t.date).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        monthlyExpenses[month] =
          (monthlyExpenses[month] || 0) + t.amount;
      }
    });

    res.status(200).json({
      income,
      expense,
      balance: income - expense,
      categoryTotals,
      monthlyExpenses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Analytics fetch failed" });
  }
};

