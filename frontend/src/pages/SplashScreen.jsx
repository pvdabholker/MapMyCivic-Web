import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

function SplashScreen() {

  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {

    setTimeout(() => {
      setShowText(true);
    }, 1000);

    setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    setTimeout(() => {
      navigate("/signin");
    }, 4000);

  }, [navigate]);

  return (

    <div
      className={`relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 bg-emerald-300/30 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-teal-300/30 blur-3xl rounded-full"></div>

      {/* GLASS CARD */}
      <div className="relative bg-white/70 backdrop-blur-2xl border border-emerald-200 shadow-2xl rounded-[40px] px-16 py-14 flex flex-col items-center">

        {/* LOGO */}
        <div className="w-40 h-40 bg-white rounded-[32px] shadow-xl border border-emerald-100 flex items-center justify-center mb-8 animate-pulse overflow-hidden">

          <img
            src={logo}
            alt="logo"
            className="w-28 h-28 object-contain"
          />

        </div>

        {/* TEXT */}
        {showText && (

          <div className="text-center animate-fade-in">

            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-wide mb-3">
              MapMyCivic
            </h1>

            <p className="text-slate-500 text-lg">
              Smart Civic Monitoring Platform
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default SplashScreen;