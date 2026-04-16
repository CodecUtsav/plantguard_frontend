import React, { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { DiagnosticTool } from "./components/DiagnosticTool";
import { DiagnosticResult } from "./components/DiagnosticResult";
import { History } from "./components/History";
import { AdminPanel } from "./components/AdminPanel";
import { Pricing } from "./components/Pricing";
import { AuthModal } from "./components/AuthModal";
import { CameraModal } from "./components/CameraModal";
import { ContactSupport } from "./components/ContactSupport";
import { AboutUs } from "./components/AboutUs";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useStore } from "./store/useStore";

export default function App() {
  const {
    fetchUser,
    user,
    history,
    setHistory,
    fetchHistory,
    setShowPricing,
    setShowSupport,
    setShowAbout,
  } = useStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  // Load local history for guests
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("plant_guard_history");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }
    } else {
      fetchHistory();
    }
  }, [user]);

  // Save local history for guests
  useEffect(() => {
    if (!user && history.length > 0) {
      localStorage.setItem("plant_guard_history", JSON.stringify(history));
    }
  }, [history, user]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FDFCF9] font-sans text-[#1A202C] selection:bg-emerald-100 selection:text-[#065F46]">
        <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />

        <main>
          <Hero />

          <section className="max-w-7xl mx-auto px-6 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7">
                <DiagnosticTool />
              </div>

              <div className="lg:col-span-5">
                <DiagnosticResult />
              </div>
            </div>
          </section>

          {/* How it Works Section */}
          <section className="bg-white border-y border-[#E5E1D8] py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="text-4xl font-black tracking-tight">
                  How PlantGuard Works
                </h2>
                <p className="text-[#718096] font-medium">
                  Three simple steps to professional plant care
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  {
                    step: "01",
                    title: "Capture",
                    desc: "Take a clear photo of the affected plant leaf using our live scanner or upload from your gallery.",
                  },
                  {
                    step: "02",
                    title: "Analyze",
                    desc: "Our AI engine scans for fungal patterns, bacterial spots, and nutrient deficiencies in seconds.",
                  },
                  {
                    step: "03",
                    title: "Heal",
                    desc: "Receive a professional diagnostic report with immediate treatment steps and long-term care advice.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="relative p-8 rounded-[32px] bg-[#FDFCF9] border border-[#E5E1D8] group hover:border-emerald-200 transition-all"
                  >
                    <span className="text-6xl font-black text-[#10B981]/10 absolute top-4 right-8 group-hover:text-[#10B981]/20 transition-colors">
                      {item.step}
                    </span>
                    <h4 className="font-bold text-xl text-[#2D3436] mb-4">
                      {item.title}
                    </h4>
                    <p className="text-[#718096] leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-[#065F46] text-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#065F46] rounded-md" />
                  </div>
                  <span className="text-2xl font-black tracking-tight">
                    PlantGuard<span className="text-emerald-400">AI</span>
                  </span>
                </div>
                <p className="text-emerald-100/60 font-medium max-w-sm leading-relaxed">
                  Empowering gardeners and farmers worldwide with
                  professional-grade AI diagnostics and sustainable treatment
                  plans.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-emerald-400">
                  Platform
                </h4>
                <ul className="space-y-4 text-sm font-bold text-emerald-100/80">
                  <li
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    Diagnostic Tool
                  </li>
                  <li
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={() => setShowPricing(true)}
                  >
                    Pricing Plans
                  </li>
                  <li
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={() => setShowSupport(true)}
                  >
                    Contact Support
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-emerald-400">
                  Company
                </h4>
                <ul className="space-y-4 text-sm font-bold text-emerald-100/80">
                  <li
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={() => setShowAbout(true)}
                  >
                    About Us
                  </li>
                  <li className="hover:text-white cursor-pointer transition-colors">
                    Privacy Policy
                  </li>
                  <li className="hover:text-white cursor-pointer transition-colors">
                    Terms of Service
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10 flex flex-col md:row items-center justify-between gap-4">
              <p className="text-xs font-bold text-emerald-100/40">
                © 2026 PlantGuard AI. All rights reserved.
              </p>
              <div className="flex gap-6">
                {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                  <span
                    key={social}
                    className="text-xs font-bold text-emerald-100/40 hover:text-white cursor-pointer transition-colors"
                  >
                    {social}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <History />
        <AdminPanel />
        <Pricing />
        <CameraModal />
        <ContactSupport />
        <AboutUs />
      </div>
    </ErrorBoundary>
  );
}
