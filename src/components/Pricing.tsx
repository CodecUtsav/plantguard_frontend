import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Note: Changed to framer-motion as it's the standard package name
import {
  X,
  Coins,
  Zap,
  Sparkles,
  Shield,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useStore } from "../store/useStore";

// Plan configuration defined outside to prevent re-renders
const PLANS = [
  {
    name: "Starter",
    credits: 10,
    price: "₹399",
    amount: 399,
    icon: Zap,
    color: "emerald",
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-100",
  },
  {
    name: "Pro",
    credits: 50,
    price: "₹1299",
    amount: 1299,
    icon: Sparkles,
    color: "blue",
    colorClass: "text-blue-600",
    bgClass: "bg-blue-100",
    popular: true,
  },
  {
    name: "Enterprise",
    credits: 200,
    price: "₹3499",
    amount: 3499,
    icon: Shield,
    color: "purple",
    colorClass: "text-purple-600",
    bgClass: "bg-purple-100",
  },
];

export const Pricing: React.FC = () => {
  const { showPricing, setShowPricing, setShowSupport, user, setUser } =
    useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const buyCredits = async (amount: number, credits: number) => {
    if (isProcessing) return;

    // Ensure Razorpay script is loaded
    if (!(window as any).Razorpay) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, credits }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "PlantGuard AI",
        description: `Purchase ${credits} Credits`,
        order_id: data.order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(
              import.meta.env.VITE_API_URL + "/verify-payment",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...response, credits }),
              },
            );
            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              if (user)
                setUser({
                  ...user,
                  credits: user.credits + verifyData.credits,
                });
              setShowPricing(false);
              alert("Payment successful!");
            } else {
              alert("Verification failed.");
            }
          } catch (e) {
            alert("Error verifying payment.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: { ondismiss: () => setIsProcessing(false) },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#10B981" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert(err instanceof Error ? err.message : "Network error.");
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {showPricing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && setShowPricing(false)}
            className="absolute inset-0 bg-[#065F46]/30 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-emerald-100"
          >
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="flex items-start justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Boost Your Diagnostics
                  </h2>
                  <p className="text-slate-500 font-medium mt-2">
                    Choose a credit pack to continue healing your garden.
                  </p>
                </div>
                <button
                  onClick={() => setShowPricing(false)}
                  disabled={isProcessing}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                  <PricingCard
                    key={plan.name}
                    plan={plan}
                    onSelect={buyCredits}
                    disabled={isProcessing}
                  />
                ))}
              </div>

              {/* Footer / Balance */}
              <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <Coins className="text-amber-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Current Balance
                    </h4>
                    <p className="text-sm font-medium text-slate-500">
                      You have{" "}
                      <span className="text-emerald-600 font-bold">
                        {user?.credits || 0}
                      </span>{" "}
                      credits remaining
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPricing(false);
                    setShowSupport(true);
                  }}
                  className="text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  Need help? Contact Support
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Sub-component for better organization
const PricingCard = ({
  plan,
  onSelect,
  disabled,
}: {
  plan: any;
  onSelect: any;
  disabled: boolean;
}) => (
  <div
    className={`relative p-8 rounded-3xl border-2 transition-all flex flex-col ${
      plan.popular
        ? "border-emerald-500 bg-emerald-50/30 scale-[1.02] shadow-xl shadow-emerald-900/5"
        : "border-slate-100 hover:border-emerald-200"
    }`}
  >
    {plan.popular && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
        Best Value
      </span>
    )}

    <div
      className={`w-12 h-12 ${plan.bgClass} rounded-2xl flex items-center justify-center mb-6`}
    >
      <plan.icon className={`w-6 h-6 ${plan.colorClass}`} />
    </div>

    <h4 className="font-bold text-xl text-slate-900">{plan.name}</h4>
    <div className="mt-2 flex items-baseline gap-1">
      <span className="text-3xl font-black text-slate-900">{plan.price}</span>
    </div>

    <p className="text-sm font-bold text-emerald-600 mt-4 bg-emerald-100 w-fit px-3 py-1 rounded-lg">
      {plan.credits} Diagnostics
    </p>

    <ul className="mt-6 space-y-3 flex-grow">
      {["Priority Analysis", "PDF Reports", "24/7 Expert Chat"].map(
        (feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm text-slate-600"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {feature}
          </li>
        ),
      )}
    </ul>

    <button
      onClick={() => onSelect(plan.amount, plan.credits)}
      disabled={disabled}
      className={`w-full mt-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
        plan.popular
          ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
          : "bg-slate-900 text-white hover:bg-slate-800"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {disabled && <Loader2 className="w-4 h-4 animate-spin" />}
      {disabled ? "Processing..." : "Buy Now"}
    </button>
  </div>
);
