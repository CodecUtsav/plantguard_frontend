import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Leaf, Shield, Globe, Users, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';

export const AboutUs: React.FC = () => {
  const { showAbout, setShowAbout } = useStore();

  return (
    <AnimatePresence>
      {showAbout && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAbout(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-8 border-b border-[#E5E1D8] flex items-center justify-between bg-[#FDFCF9] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Leaf className="text-[#065F46] w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1A202C]">About PlantGuard AI</h2>
                  <p className="text-xs font-bold text-[#718096] uppercase tracking-widest">Our Mission & Vision</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAbout(false)}
                className="p-3 hover:bg-[#F5F2EB] rounded-2xl transition-colors"
              >
                <X className="w-7 h-7 text-[#4A5568]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-[#1A202C] leading-tight">
                  Democratizing Professional Plant Care Through <span className="text-[#10B981]">Artificial Intelligence</span>
                </h3>
                <p className="text-[#718096] font-medium leading-relaxed text-lg">
                  Founded in 2024, PlantGuard AI was born out of a simple observation: while large-scale industrial farms have access to advanced diagnostic tools, home gardeners and small-scale farmers are often left guessing when their plants show signs of distress.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#065F46]" />
                  </div>
                  <h4 className="font-black text-[#1A202C] uppercase tracking-widest text-sm">Reliability</h4>
                  <p className="text-xs font-medium text-[#718096] leading-relaxed">
                    Our AI models are trained on millions of verified botanical images to ensure professional-grade accuracy in every scan.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#065F46]" />
                  </div>
                  <h4 className="font-black text-[#1A202C] uppercase tracking-widest text-sm">Sustainability</h4>
                  <p className="text-xs font-medium text-[#718096] leading-relaxed">
                    We prioritize organic and eco-friendly treatment recommendations to protect your garden and the planet.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#065F46]" />
                  </div>
                  <h4 className="font-black text-[#1A202C] uppercase tracking-widest text-sm">Community</h4>
                  <p className="text-xs font-medium text-[#718096] leading-relaxed">
                    Empowering over 50,000 gardeners worldwide to grow healthier, more resilient plants.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-[#065F46]" />
                  </div>
                  <h4 className="font-black text-[#1A202C] uppercase tracking-widest text-sm">Passion</h4>
                  <p className="text-xs font-medium text-[#718096] leading-relaxed">
                    We are a team of botanists, data scientists, and plant lovers dedicated to the green revolution.
                  </p>
                </div>
              </div>

              <div className="bg-[#FDFCF9] border border-[#E5E1D8] p-8 rounded-[32px] space-y-4">
                <h4 className="font-black text-xl text-[#1A202C]">Our Technology</h4>
                <p className="text-sm font-medium text-[#718096] leading-relaxed">
                  Using state-of-the-art computer vision and deep learning, PlantGuard AI analyzes leaf morphology, discoloration patterns, and structural changes to identify over 200 different plant pathologies in real-time.
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#FDFCF9] border-t border-[#E5E1D8] shrink-0">
              <button 
                onClick={() => setShowAbout(false)}
                className="w-full bg-[#065F46] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-[#047857] transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
