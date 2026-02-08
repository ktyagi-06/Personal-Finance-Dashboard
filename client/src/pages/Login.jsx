import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const update = (k,v)=>setForm(p=>({...p,[k]:v}));

  const submit = async () => {
    try {
      if (isRegister) {
        await api.post("/auth/register", form);
        alert("Registered — now login");
        setIsRegister(false);
        return;
      }

      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password
      });

      localStorage.setItem("token", res.data.token);
      nav("/");

    } catch (e) {
      alert(e.response?.data?.msg || e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-black">

      <div className="w-[900px] grid grid-cols-2 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

        {/* LEFT IMAGE PANEL */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 p-10 text-white">
            <h1 className="text-3xl font-bold mb-4">Welcome</h1>
            <p className="opacity-80">
              Manage your money smarter with your Personalised Finance Dashboard.
            </p>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="p-10 bg-white">

          <h2 className="text-2xl font-semibold mb-6">
            {isRegister ? "Register" : "Login"}
          </h2>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="First Name"
                className="inputLight"
                onChange={e=>update("firstName",e.target.value)}
              />
              <input
                placeholder="Last Name"
                className="inputLight"
                onChange={e=>update("lastName",e.target.value)}
              />
            </div>
          )}

          <input
            placeholder="Email"
            className="inputLight mt-3"
            onChange={e=>update("email",e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="inputLight mt-3"
            onChange={e=>update("password",e.target.value)}
          />

          <button onClick={submit} className="btnPurple mt-5">
            {isRegister ? "Register Now" : "Login"}
          </button>

          <p
            onClick={()=>setIsRegister(v=>!v)}
            className="mt-4 text-indigo-600 cursor-pointer"
          >
            {isRegister ? "Have account? Login" : "Create account"}
          </p>
        </div>
      </div>
    </div>
  );
}