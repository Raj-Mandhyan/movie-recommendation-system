import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Film, Info, Sliders, Menu, X, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 w-full z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="glassmorphism rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              CineMind<span className="text-amber-400">.AI</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-amber-500/15 text-white border border-amber-500/30 shadow-lg shadow-amber-500/5 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <Film className="h-4 w-4" />
              <span>Explore</span>
            </NavLink>
            <NavLink
              to="/recommend"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-amber-500/15 text-white border border-amber-500/30 shadow-lg shadow-amber-500/5 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <Sliders className="h-4 w-4" />
              <span>AI Recommendations</span>
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-amber-500/15 text-white border border-amber-500/30 shadow-lg shadow-amber-500/5 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <Info className="h-4 w-4" />
              <span>Pipeline & Metrics</span>
            </NavLink>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-6 absolute top-full left-0 w-full z-50">
          <div className="glassmorphism rounded-2xl p-4 flex flex-col gap-3 shadow-2xl animate-in fade-in slide-in-from-top-5 duration-200">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <Film className="h-5 w-5 text-amber-400" />
              <span className="font-medium">Explore</span>
            </Link>
            <Link
              to="/recommend"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <Sliders className="h-5 w-5 text-amber-500" />
              <span className="font-medium">AI Recommendations</span>
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <Info className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Pipeline & Metrics</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
