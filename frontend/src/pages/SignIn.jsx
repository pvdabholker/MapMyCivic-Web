import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Enter credentials");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://127.0.0.1:8000/authority/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // ✅ Save token
      localStorage.setItem("token", data.access_token);

      // ✅ Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 px-4 overflow-hidden">

    {/* Background Glow */}
    <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300/20 blur-3xl rounded-full"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300/20 blur-3xl rounded-full"></div>

    <div className="relative w-full max-w-md">

      {/* Main Card */}
      <div className="relative bg-white/80 backdrop-blur-2xl border border-emerald-200 rounded-[32px] shadow-2xl overflow-hidden">

        {/* Top Gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>

        <div className="p-8">

          {/* Logo */}
          <div className="flex justify-center mb-6">

            <div className="w-24 h-24 rounded-3xl bg-white shadow-xl border border-emerald-100 flex items-center justify-center overflow-hidden">

              <img
                src={logo}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />

            </div>

          </div>

          {/* Heading */}
          <div className="text-center mb-8">

            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-2">
              Authority Sign In
            </h2>

            <p className="text-slate-500 text-sm">
              Access the civic monitoring dashboard
            </p>

          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-4 rounded-2xl shadow-sm">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div className="flex flex-col gap-2">

              <label className="text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/70 border border-emerald-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-2">

              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="bg-white/70 border border-emerald-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-4 rounded-2xl font-semibold shadow-lg hover:shadow-emerald-300/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

        </div>

      </div>

    </div>
  </div>
);
}

export default SignIn;