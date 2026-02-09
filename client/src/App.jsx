import AIChat from "./components/AIChat";
import api from "./api";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";

<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
);

/* ================= COUNT-UP HOOK ================= */
function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);

    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return display;
}

export default function App() {
  /* ================= THEME ================= */
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* ================= STATE ================= */
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD ================= */

  const loadAll = async () => {
    try {
      setLoading(true);

      console.log("➡️ calling /transactions");
      const tRes = await api.get("/transactions");
      setTransactions(tRes.data);

      const aRes = await api.get("/transactions/analytics");
      setAnalytics(aRes.data);

      setError("");
    } catch (err) {
      console.log("API ERROR:", err.response?.status, err.response?.data);
      setError("API failed — token or backend issue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No login token found — please login first");
      setLoading(false);
      return;
    }

    loadAll();

    // optional polling refresh
    const id = setInterval(loadAll, 5000);
    return () => clearInterval(id);
  }, []);

  /* ================= ADD ================= */

  const addTransaction = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const newTx = {
      amount: Number(form.get("amount")),
      category: form.get("category"),
      type: form.get("type"),
      date: new Date(),
    };

    await api.post("/transactions", newTx);
    e.target.reset();
    loadAll();
  };

  /* ================= TOTALS ================= */

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  /* ================= CHART DATA ================= */

  const incomeExpenseData = {
    labels: ["Income", "Expense"],
    datasets: [{ data: [income, expense] }]
  };

  const byCategory = {};
  transactions.forEach(t => {
    if (t.type === "expense") {
      byCategory[t.category] =
        (byCategory[t.category] || 0) + t.amount;
    }
  });

  const categoryPieData = {
    labels: Object.keys(byCategory),
    datasets: [{ data: Object.values(byCategory) }]
  };

  const lineData = {
    labels: transactions.map(t =>
      new Date(t.date).toLocaleDateString()
    ),
    datasets: [{ data: transactions.map(t => t.amount), fill: true }]
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen p-10 text-slate-100 bg-slate-950">

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 px-4 py-2 rounded-xl bg-slate-800"
      >
        Toggle Theme
      </button>

      <h1 className="text-4xl font-bold mb-6 text-center">
        Finance Dashboard
      </h1>

      {!localStorage.getItem("token") && (
        <p className="text-red-400 text-center mb-4">
          No login token found — frontend cannot load data
        </p>
      )}

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Income" value={income} />
        <SummaryCard title="Expense" value={expense} />
        <SummaryCard title="Balance" value={income - expense} />
      </div>

      {/* FORM */}
      <form onSubmit={addTransaction} className="grid md:grid-cols-4 gap-4 mb-10">
        <input name="amount" type="number" placeholder="Amount" className="bg-slate-800 p-3 rounded" />
        <input name="category" placeholder="Category" className="bg-slate-800 p-3 rounded" />
        <select name="type" className="bg-slate-800 p-3 rounded">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button className="bg-blue-600 rounded">Add</button>
      </form>

      {/* CHARTS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Doughnut data={incomeExpenseData} />
        <Doughnut data={categoryPieData} />
        <Line data={lineData} />
      </div>

      {/* LIST */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      <ul>
        {transactions.map(t => (
          <li key={t._id}>
            {t.category} — ₹{t.amount}
          </li>
        ))}
      </ul>

      {/* AI */}
      <AIChat transactions={transactions} />

    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function SummaryCard({ title, value }) {
  const animated = useCountUp(value);
  return (
    <div className="bg-slate-900 p-6 rounded-xl">
      <h2>{title}</h2>
      <p className="text-2xl font-bold">₹{animated}</p>
    </div>
  );
}
