import { useState } from "react";

export default function AIChat({ transactions = [] }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          transactions,
          history: messages,
        }),
      });

      const data = await res.json();

      const aiMsg = { role: "assistant", content: data.reply };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠ AI service unavailable."
      }]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4 h-80 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded-lg ${
            m.role === "user" ? "bg-indigo-700 text-white ml-auto max-w-[75%]" : "bg-slate-800 text-slate-200 max-w-[85%]"
          }`}>
            {m.content}
          </div>
        ))}
        {loading && <p className="text-slate-400">Thinking...</p>}
      </div>

      <div className="flex mt-2 gap-2">
        <input
          className="flex-1 bg-slate-800 text-white p-2 rounded-lg border border-white/10"
          placeholder="Ask financial questions..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-indigo-600 px-3 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

