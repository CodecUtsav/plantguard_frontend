import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Send,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useStore } from "../store/useStore";

export const ContactSupport: React.FC = () => {
  const { showSupport, setShowSupport, user } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  // Handle Esc key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSupport(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setShowSupport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user?.id }),
      });

      if (res.ok) {
        setIsSuccess(true);
        // Reset only transient fields
        setFormData((prev) => ({ ...prev, subject: "", message: "" }));

        // Auto-close after success
        setTimeout(() => {
          setIsSuccess(false);
          setShowSupport(false);
        }, 2500);
      } else {
        throw new Error("Something went wrong. Please try again later.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {showSupport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSupport(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <header className="p-6 sm:p-8 border-b border-[#E5E1D8] flex items-center justify-between bg-[#FDFCF9]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="text-[#065F46] w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1A202C]">
                    Contact Support
                  </h2>
                  <p className="text-[10px] font-black text-[#718096] uppercase tracking-[0.2em]">
                    Expert help for your garden
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupport(false)}
                className="p-2 hover:bg-[#F5F2EB] rounded-xl transition-colors text-[#4A5568]"
                aria-label="Close Support Modal"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            {/* Content Body */}
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-[#1A202C]">
                        Message Received!
                      </h3>
                      <p className="text-[#718096] font-medium">
                        Our team will sprout an answer in your inbox soon.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {errorMessage && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                        <AlertCircle className="w-5 h-5" />
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Full Name"
                        value={formData.name}
                        onChange={(val: any) =>
                          setFormData({ ...formData, name: val })
                        }
                        placeholder="John Doe"
                      />
                      <FormInput
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(val: any) =>
                          setFormData({ ...formData, email: val })
                        }
                        placeholder="john@example.com"
                      />
                    </div>

                    <FormInput
                      label="Subject"
                      value={formData.subject}
                      onChange={(val: any) =>
                        setFormData({ ...formData, subject: val })
                      }
                      placeholder="e.g., Credits not showing up"
                    />

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#1A202C] uppercase tracking-widest ml-1">
                        How can we help?
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full px-5 py-4 bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium resize-none placeholder:text-slate-300"
                        placeholder="Please describe your issue in detail..."
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full bg-[#065F46] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#047857] transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Request
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Reusable Input Component to keep code DRY
const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-[#1A202C] uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      required
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-5 py-4 bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium placeholder:text-slate-300"
    />
  </div>
);
