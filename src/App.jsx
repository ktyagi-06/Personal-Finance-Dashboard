import AIChat from "./components/AIChat";
import { useState, useEffect } from "react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement
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
  /* ================= DARK MODE ================= */
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    const root = document.documentElement;
    darkMode ? root.classList.add("dark") : root.classList.remove("dark");
  }, [darkMode]);

  /* ================= TRANSACTIONS ================= */
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/transactions")
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load transactions");
        setLoading(false);
      });
  }, []);

  const addTransaction = async (e) => {
    e.preventDefault();

    const payload = {
      amount: Number(e.target.amount.value),
      category: e.target.category.value,
      type: e.target.type.value,
    };

    const res = await fetch("http://localhost:5000/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const saved = await res.json();
    setTransactions(prev => [saved, ...prev]);
    e.target.reset();
  };

  /* ================= ANALYTICS ================= */
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/transactions/analytics")
      .then(res => res.json())
      .then(data => setAnalytics(data || null))
      .catch(() => setAnalytics(null));
  }, []);

  /* ================= TOTALS ================= */
  const income =
    analytics?.income ??
    transactions.filter(t => t.type === "income")
      .reduce((a, b) => a + b.amount, 0);

  const expense =
    analytics?.expense ??
    transactions.filter(t => t.type === "expense")
      .reduce((a, b) => a + b.amount, 0);

  /* ================= CHART DATA ================= */
  const incomeExpenseData = {
    labels: ["Income", "Expense"],
    datasets: [{
      data: [income || 0, expense || 0],
      backgroundColor: ["#22c55e", "#ef4444"],
    }],
  };

  const categoryTotals =
    analytics?.categoryTotals && Object.keys(analytics.categoryTotals).length
      ? analytics.categoryTotals
      : { "No Data": 1 };

  const categoryPieData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        "#ef4444",
        "#3b82f6",
        "#22c55e",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
      ],
    }],
  };

  const expenseTrend =
    analytics?.expenseTrend?.length
      ? analytics.expenseTrend
      : transactions
          .filter(t => t.type === "expense")
          .sort((a, b) => new Date(a.date) - new Date(b.date));

  const lineData = {
    labels: expenseTrend.map(t =>
      t?.date ? new Date(t.date).toLocaleDateString() : "N/A"
    ),
    datasets: [{
      data: expenseTrend.map(t => t.amount || 0),
      borderColor: "#ef4444",
      backgroundColor: "rgba(239,68,68,0.25)",
      tension: 0.4,
      fill: true,
    }],
  };

  const monthlyTotals =
    analytics?.monthlyExpenses && Object.keys(analytics.monthlyExpenses).length
      ? analytics.monthlyExpenses
      : { "No Data": 1 };

  const barData = {
    labels: Object.keys(monthlyTotals),
    datasets: [{
      data: Object.values(monthlyTotals),
      backgroundColor: "#3b82f6",
      barThickness: 26,
    }],
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100 p-10">

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 px-4 py-2 rounded-xl bg-slate-800 border border-white/10"
      >
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </button>

      <div className="text-center mb-14">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          Finance Dashboard
        </h1>
        <p className="mt-4 text-slate-400">
          Track your financial journey with precision
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <SummaryCard title="Income" value={income} color="text-green-400" />
        <SummaryCard title="Expense" value={expense} color="text-red-400" />
        <SummaryCard title="Balance" value={income - expense} />
      </div>

      {/* ✅ AI CHAT — FIXED LOCATION */}
      <ChartCard title="AI Financial Advisor">
        <AIChat transactions={transactions} />
      </ChartCard>

      <form
        onSubmit={addTransaction}
        className="bg-slate-900/70 p-6 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
      >
        <input name="amount" type="number" placeholder="Amount" className="bg-slate-800 p-3 rounded-xl" />
        <input name="category" placeholder="Category" className="bg-slate-800 p-3 rounded-xl" />
        <select name="type" className="bg-slate-800 p-3 rounded-xl">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-semibold">
          Add
        </button>
      </form>

      <ChartCard title="Analytics Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChartBox title="Income vs Expense">
            <Doughnut data={incomeExpenseData} />
          </ChartBox>
          <ChartBox title="Expense by Category">
            <Doughnut data={categoryPieData} />
          </ChartBox>
          <ChartBox title="Expense Trend">
            <Line data={lineData} />
          </ChartBox>
        </div>
      </ChartCard>

      <ChartCard title="Monthly Expenses">
        <div style={{ height: 350 }}>
          <Bar data={barData} />
        </div>
      </ChartCard>

      <ChartCard title="Recent Transactions">
        {loading && <p className="text-center text-slate-400">Loading...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}
        {!loading && !error && (
          <ul className="space-y-3">
            {transactions.map(t => (
              <li key={t._id || t.id} className="flex justify-between border-b border-white/10 pb-2">
                <span>{t.category}</span>
                <span className={t.type === "income" ? "text-green-400" : "text-red-400"}>
                  ₹{t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </div>
  );
}

/* ================= COMPONENTS ================= */
function SummaryCard({ title, value, color }) {
  const animated = useCountUp(value);
  return (
    <div className="bg-slate-900/70 p-6 rounded-2xl border border-white/10">
      <h2 className="text-slate-400">{title}</h2>
      <p className={`text-3xl font-bold ${color || ""}`}>₹{animated}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-slate-900/70 p-6 rounded-2xl border border-white/10 mb-12">
      <h2 className="text-center font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5">
      <h3 className="text-center text-sm mb-4 text-slate-400">{title}</h3>
      <div style={{ height: 220 }}>{children}</div>
    </div>
  );
}
