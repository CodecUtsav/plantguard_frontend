import React, { useState } from "react";
import {
  Leaf,
  User as UserIcon,
  LogOut,
  History as HistoryIcon,
  Shield,
  Coins,
  Menu,
  X,
} from "lucide-react";
import { useStore } from "../store/useStore";

interface NavbarProps {
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    user,
    logout,
    setShowHistory,
    setShowAdminPanel,
    setShowPricing,
    setShowSupport,
    setShowAbout,
  } = useStore();

  const navLinks = [
    { label: "About", onClick: () => setShowAbout(true) },
    { label: "Support", onClick: () => setShowSupport(true) },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <Leaf className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            PlantGuard<span className="text-emerald-500">AI</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              {/* Credits & Links */}
              <div className="hidden lg:flex items-center gap-6 mr-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={link.onClick}
                    className="text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowPricing(true)}
                className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full border border-emerald-100 text-sm font-bold hover:bg-emerald-100 transition-all"
              >
                <Coins className="w-4 h-4 text-emerald-600" />
                <span className="tabular-nums">{user.credits}</span> Credits
              </button>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                <NavIconBtn
                  icon={HistoryIcon}
                  title="History"
                  onClick={() => setShowHistory(true)}
                />

                {user.role === "admin" && (
                  <NavIconBtn
                    icon={Shield}
                    title="Admin Panel"
                    variant="admin"
                    onClick={() => setShowAdminPanel(true)}
                  />
                )}
              </div>

              <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

              {/* Profile & Logout */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider leading-none mb-1">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 lg:hidden text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className="w-full text-left px-4 py-3 text-slate-700 font-bold hover:bg-slate-50 rounded-lg"
              onClick={() => {
                link.onClick();
                setIsMobileMenuOpen(false);
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

/**
 * Reusable Icon Button for Navbar
 */
const NavIconBtn = ({
  icon: Icon,
  onClick,
  title,
  variant = "default",
}: {
  icon: any;
  onClick: () => void;
  title: string;
  variant?: "default" | "admin";
}) => (
  <button
    onClick={onClick}
    className={`p-2.5 rounded-xl transition-colors ${
      variant === "admin"
        ? "text-emerald-700 hover:bg-emerald-50"
        : "text-slate-500 hover:bg-slate-100"
    }`}
    title={title}
  >
    <Icon className="w-5 h-5" />
  </button>
);
