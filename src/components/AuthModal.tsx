import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  AlertCircle,
  Leaf,
  Eye,
  EyeOff,
} from "lucide-react";
import { useStore } from "../store/useStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setUser, fetchHistory } = useStore();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Clear errors when switching modes
  useEffect(() => {
    setAuthError(null);
  }, [authMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Client-side Validation
    if (authMode === "signup" && authForm.password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);

    try {
      const endpoint =
        authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        onClose();
        fetchHistory();
      } else {
        setAuthError(
          data.error || "Authentication failed. Please check your credentials.",
        );
      }
    } catch (err) {
      setAuthError("Could not connect to the server. Check your internet.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#065F46]/30 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-emerald-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors z-10"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10">
              <div className="flex flex-col items-center text-center mb-8">
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="w-16 h-16 bg-[#065F46] rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-900/20 mb-6"
                >
                  <Leaf className="text-white w-8 h-8" />
                </motion.div>
                <h2 className="text-3xl font-black text-[#1A202C] tracking-tight">
                  {authMode === "login" ? "Welcome Back" : "Join PlantGuard"}
                </h2>
                <p className="text-[#718096] font-medium mt-2 text-sm">
                  {authMode === "login"
                    ? "Scan, save, and heal your garden."
                    : "Get 5 free scan credits upon registration."}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {authMode === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="relative"
                    >
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        autoFocus
                        value={authForm.name}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, name: e.target.value })
                        }
                        className="w-full pl-12 pr-6 py-4 bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={authForm.email}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, email: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={authForm.password}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, password: e.target.value })
                    }
                    className="w-full pl-12 pr-12 py-4 bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#065F46] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 text-[#E53E3E] text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full bg-[#065F46] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#047857] transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : authMode === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[#718096] font-medium text-sm">
                  {authMode === "login"
                    ? "New to the garden?"
                    : "Already a member?"}
                  <button
                    onClick={() =>
                      setAuthMode(authMode === "login" ? "signup" : "login")
                    }
                    className="ml-2 text-[#065F46] font-black hover:text-emerald-700 transition-colors"
                  >
                    {authMode === "login" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
