import api from "./api";
//import AIChat from "./components/AIChat";
import { useState, useEffect } from "react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  LineElement, PointElement,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  LineElement, PointElement,
  BarElement
);

export default function App() {

  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  //const [chatOpen, setChatOpen] = useState(false);
  const [darkBg, setDarkBg] = useState(true);

  /* ================= REFRESH ALL ================= */

  const refreshAll = async () => {
  try {
    const t = await api.get("/transactions");
    console.log("TX DATA:", t.data);
    setTransactions(t.data);

    const a = await api.get("/transactions/analytics");
    console.log("ANALYTICS:", a.data);
    setAnalytics(a.data);

  } catch (e) {
    console.error(
      "DATA LOAD ERROR:",
      e.response?.data || e.message
    );
  }
};
  useEffect(() => {
    refreshAll();
  }, []);

  /* ================= ADD TRANSACTION ================= */

  const addTransaction = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        amount: Number(e.target.amount.value),
        category: e.target.category.value,
        type: e.target.type.value,
        date: new Date()
      };

      await api.post("/transactions", payload);

      e.target.reset();
      refreshAll();   // ✅ real-time refresh

    } catch (e) {
      alert(e.response?.data?.msg || "Add failed");
    }
  };

  /* ================= ANALYTICS ================= */

  const income = analytics?.income ?? 0;
  const expense = analytics?.expense ?? 0;
  const categoryTotals = analytics?.categoryTotals ?? {};
  const trend = analytics?.expenseTrend ?? [];
  const monthly = analytics?.monthlyExpenses ?? {};

  const pieColors = [
    "#ef4444","#3b82f6","#22c55e",
    "#f59e0b","#8b5cf6","#ec4899"
  ];

  const chartOpts = {
    maintainAspectRatio:false,
    responsive:true
  };

  /* ================= THEME ================= */

  const pageBg = darkBg
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white"
    : "bg-gradient-to-br from-slate-100 via-indigo-50 to-pink-50 text-slate-900";

  const glassCard = darkBg
    ? "bg-slate-900/70 border border-white/10"
    : "bg-white/70 border border-slate-200 shadow-lg";

  const inputClass = darkBg
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-slate-300 text-slate-900";

  /* ================= UI ================= */

  return (
  <div className={`min-h-screen p-10 space-y-10 transition-colors ${pageBg}`}>

    {/* ===== HEADER ===== */}
    <div className="flex justify-between items-center">

      <h1 className="text-4xl font-bold
        bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500
        bg-clip-text text-transparent">
        Personalised Finance Dashboard
      </h1>

      <div className="flex gap-3">

        <button
          onClick={()=>setDarkBg(v=>!v)}
          className={`${glassCard} px-4 py-2 rounded-xl hover:scale-105`}>
          {darkBg ? "Light BG" : "Dark BG"}
        </button>

        <div className={`${glassCard} px-5 py-2 rounded-xl`}>
          <button
            onClick={()=>{
              localStorage.removeItem("token");
              window.location.href="/login";
            }}
            className="text-red-400 hover:text-red-300">
            Logout
          </button>
        </div>

      </div>
    </div>

    {/* ===== SUMMARY ===== */}
    <div className="grid md:grid-cols-3 gap-6">
      <Stat title="Income" value={income} green darkBg={darkBg}/>
      <Stat title="Expense" value={expense} red darkBg={darkBg}/>
      <Stat title="Balance" value={income-expense} darkBg={darkBg}/>
    </div>

    {/* ===== CHARTS ===== */}
    <div className="grid md:grid-cols-3 gap-6">

      <ChartCard title="Income vs Expense" darkBg={darkBg}>
        <Doughnut data={{
          labels:["Income","Expense"],
          datasets:[{
            data:[income,expense],
            backgroundColor:["#22c55e","#ef4444"]
          }]
        }} options={chartOpts}/>
      </ChartCard>

      <ChartCard title="By Category" darkBg={darkBg}>
        <Doughnut data={{
          labels:Object.keys(categoryTotals),
          datasets:[{
            data:Object.values(categoryTotals),
            backgroundColor: pieColors
          }]
        }} options={chartOpts}/>
      </ChartCard>

      <ChartCard title="Expense Trend" darkBg={darkBg}>
        <Line data={{
          labels:trend.map(t =>
            t?.date ? new Date(t.date).toLocaleDateString() : ""),
          datasets:[{
            label:"Expense",
            data:trend.map(t=>t.amount),
            borderColor:"#ef4444"
          }]
        }} options={chartOpts}/>
      </ChartCard>

    </div>

    {/* ===== MONTHLY ===== */}
    <ChartCard title="Monthly Expenses" darkBg={darkBg}>
      <Bar data={{
        labels:Object.keys(monthly),
        datasets:[{
          label:"Expense",
          data:Object.values(monthly),
          backgroundColor:"#3b82f6"
        }]
      }} options={chartOpts}/>
    </ChartCard>

    {/* ===== ADD FORM ===== */}
    <div className={`${glassCard} rounded-xl p-6 card-3d`}>
      <form onSubmit={addTransaction}
        className="grid md:grid-cols-4 gap-4">

        <input name="amount" placeholder="Amount"
          required
          className={`p-3 rounded-xl border ${inputClass}`} />

        <input name="category" placeholder="Category"
          required
          className={`p-3 rounded-xl border ${inputClass}`} />

        <select name="type"
          className={`p-3 rounded-xl border ${inputClass}`}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <button className="rounded-xl bg-indigo-600 text-white hover:scale-105 transition">
          Add Transaction
        </button>

      </form>
    </div>

    {/* ===== TRANSACTIONS ===== */}
    <div className={`${glassCard} rounded-2xl p-6 card-3d`}>
      <h2 className="text-lg font-semibold mb-4">Transactions</h2>

      <div className="max-h-72 overflow-y-auto divide-y pr-4">
        {transactions.map(t => {
          const amt = Number(t.amount) || 0;

          return (
            <div key={t._id} className="flex justify-between py-3">
              <div>
                <div className="font-medium">{t.category}</div>
                {t.date &&
                  <div className="text-xs opacity-60">
                    {new Date(t.date).toLocaleDateString()}
                  </div>}
              </div>

              <div className={`font-semibold
                ${t.type==="income"
                  ? "text-green-500"
                  : "text-red-500"}`}>
                ₹{amt.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* ===== CHAT ===== */}
    

  </div>
  );
}

/* ================= COMPONENTS ================= */

function Stat({title,value,green,red,darkBg}) {
  const glass = darkBg
    ? "bg-slate-900/70 border border-white/10"
    : "bg-white/80 border border-slate-200 shadow";

  return (
    <div className={`${glass} p-6 rounded-xl`}>
      <p className="opacity-60">{title}</p>
      <p className={`text-3xl font-bold
        ${green?"text-green-500":red?"text-red-500":""}`}>
        ₹{value}
      </p>
    </div>
  );
}

function ChartCard({title,children,darkBg}) {
  const glass = darkBg
    ? "bg-slate-900/70 border border-white/10"
    : "bg-white/80 border border-slate-200 shadow";

  return (
    <div className={`${glass} p-6 rounded-xl h-[320px]`}>
      <p className="opacity-60 mb-4">{title}</p>
      <div className="h-[240px]">{children}</div>
    </div>
  );
}