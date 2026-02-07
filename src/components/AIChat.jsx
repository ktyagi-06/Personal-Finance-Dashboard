import { useState } from "react";
import api from "../api";

export default function AIChat() {
  const [q,setQ] = useState("");
  const [msgs,setMsgs] = useState([]);
  const [loading,setLoading] = useState(false);

  const ask = async () => {
    if (!q) return;

    setMsgs(m=>[...m,{role:"user",text:q}]);
    setLoading(true);

    try {
      const r = await api.post("/ai/chat", {
        question:q
      });

      setMsgs(m=>[
        ...m,
        { role:"ai", text:r.data.reply }
      ]);

    } catch {
      setMsgs(m=>[
        ...m,
        { role:"ai", text:"AI service unavailable" }
      ]);
    }

    setLoading(false);
    setQ("");
  };

  return (
    <div className="space-y-3">

      <div className="max-h-64 overflow-y-auto space-y-2">
        {msgs.map((m,i)=>(
          <div key={i}
            className={`p-2 rounded-xl text-sm
            ${m.role==="user"
              ? "bg-indigo-600 text-white ml-10"
              : "bg-slate-700 text-white mr-10"}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="text-sm opacity-70">Thinking…</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          className="flex-1 p-2 rounded bg-slate-800 border border-slate-700"
          placeholder="Ask finance questions..."
        />
        <button
          onClick={ask}
          className="bg-indigo-600 px-4 rounded">
          Ask
        </button>
      </div>

    </div>
  );
}