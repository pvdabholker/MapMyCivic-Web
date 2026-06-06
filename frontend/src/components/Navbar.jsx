import { useNavigate, useLocation } from "react-router-dom";
import logo from "../images/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 DIRECTLY DERIVE ROLE (NO STATE, NO EFFECT)
  let role = null;

  const token = localStorage.getItem("token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role;
    } catch {
      // ignore invalid token
    }
  }

  // NAVIGATION ITEM
  const navItem = (name, path) => (
    <button
      onClick={() => navigate(path)}
      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
        location.pathname === path
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
      }`}
    >
      {name}
    </button>
  );

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-emerald-200 shadow-sm">

      <div className="px-8 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-4 cursor-pointer group"
        >

          <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-emerald-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-all duration-300">

            <img
              src={logo}
              alt="MapMyCivic"
              className="w-9 h-9 object-contain"
            />

          </div>

          <div>

            <h1 className="font-extrabold text-2xl bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-wide">
              MapMyCivic
            </h1>

            <p className="text-xs text-slate-500 -mt-1">
              Civic Monitoring Platform
            </p>

          </div>

        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-lg border border-emerald-100 px-3 py-2 rounded-2xl shadow-md">

          {navItem("Dashboard", "/dashboard")}
          {navItem("Map View", "/map")}
          {navItem("Reports", "/reports")}
          {navItem("Public Notices", "/notices")}

          {/* ROLE BASED */}
          {role === "admin" && navItem("Admin Panel", "/admin")}

        </div>

      </div>

    </div>
  );
}

export default Navbar;