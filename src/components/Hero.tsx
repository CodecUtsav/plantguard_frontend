import React from "react";
import { motion } from "framer-motion"; // Standard import
import { Sparkles, ArrowRight, Info } from "lucide-react";
import { useStore } from "../store/useStore";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export const Hero: React.FC = () => {
  const { setShowAbout } = useStore();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-[#FDFCF9]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-100/40 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[15%] w-[400px] h-[400px] bg-emerald-50/50 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto space-y-10"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-[#065F46] px-4 py-2 rounded-full border border-emerald-200/50 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-emerald-600/20" />
              Next-Gen Plant Pathology
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-[#1A202C] leading-[1.05] tracking-tight"
          >
            Heal Your Plants with <br className="hidden md:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-[#065F46]">Precision AI</span>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-2 left-0 h-3 md:h-4 bg-emerald-100 -z-10 rounded-full"
              />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-[#4A5568] font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Instant diagnostic reports, treatment plans, and long-term care
            advice for over 1,000+ species. Professional agricultural science,
            simplified for you.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                document
                  .getElementById("diagnostic-tool")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full sm:w-auto bg-[#065F46] text-white px-10 py-5 rounded-2xl font-bold hover:bg-[#054d39] transition-colors shadow-2xl shadow-emerald-900/20 flex items-center justify-center gap-3 group text-lg"
            >
              Start Diagnosis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "#F5F2EB" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAbout(true)}
              className="w-full sm:w-auto bg-white text-[#4A5568] px-10 py-5 rounded-2xl font-bold border border-[#E5E1D8] transition-all flex items-center justify-center gap-3 text-lg"
            >
              <Info className="w-5 h-5" />
              Learn More
            </motion.button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-4 pt-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-4 border-[#FDFCF9] bg-[#F5F2EB] overflow-hidden shadow-sm"
                >
                  <img
                    src={`https://i.pravatar.cc/150?u=plant${i}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#FDFCF9] bg-[#065F46] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                +2k
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className="w-3 h-3 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-[#718096]">
                Trusted by{" "}
                <span className="text-[#1A202C]">2,000+ gardeners</span>{" "}
                worldwide
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
