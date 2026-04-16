import React, { useRef, useCallback } from "react";
import {
  Upload,
  Camera,
  Zap,
  Loader2,
  Info,
  X,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Extract constant tips for cleaner JSX
const DIAGNOSTIC_TIPS = [
  "Use natural, bright lighting",
  "Focus clearly on the affected area",
  "Avoid blurry or dark images",
  "Ensure the leaf is the main subject",
];

export const DiagnosticTool: React.FC = () => {
  const {
    image,
    setImage,
    isAnalyzing,
    setIsAnalyzing,
    setResult,
    setError,
    setLoadingMessage,
    user,
    setShowPricing,
    setIsCameraOpen,
    error,
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized file processor to prevent unnecessary re-renders
  const processFile = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please upload a valid image file (JPG, PNG).");
        return;
      }

      // Check file size (e.g., 10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Image is too large. Please upload an image under 10MB.");
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(selectedFile);
    },
    [setImage, setError, setResult],
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const analyzePlant = async () => {
    if (!image) return;

    // Credit Guard
    if (user && user.credits <= 0 && user.role !== "admin") {
      setShowPricing(true);
      return;
    }

    setIsAnalyzing(true);
    setLoadingMessage("Consulting AI Pathologist...");
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview", // Use stable flash for cost/speed
        generationConfig: { responseMimeType: "application/json" }, // Force JSON
      });

      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];

      const prompt = `Analyze this plant leaf image. Identify diseases, status, causes, precautions, treatment, and long-term care.
      Return JSON: { "disease": string, "status": string, "cause": string, "precautions": string, "treatment": string, "longTermCare": string, "confidence": string }`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType } },
      ]);

      const response = await result.response;
      const resultData = JSON.parse(response.text());

      setResult(resultData);

      // Persistence & Sync
      if (user) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image, result: resultData }),
        });

        // Update credits locally
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          useStore.getState().setUser(userData.user);
        }
      }
    } catch (err: any) {
      setError(
        "AI Analysis failed. This usually happens with blurry images or API limits.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="diagnostic-tool" className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-2xl border border-[#E5E1D8] relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl -z-0" />

        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                processFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-[#F0FDF4] rounded-[32px] p-8 md:p-12 flex flex-col items-center justify-center text-center gap-6 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group min-h-[420px] relative z-10"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                <Upload className="text-emerald-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1A202C]">
                  Upload Specimen
                </h3>
                <p className="text-[#718096] mt-2 font-medium">
                  Drag and drop or click to scan a plant leaf
                </p>
              </div>

              <div className="flex items-center gap-4 w-full max-w-xs">
                <div className="h-px bg-[#E5E1D8] flex-1"></div>
                <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">
                  OR
                </span>
                <div className="h-px bg-[#E5E1D8] flex-1"></div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCameraOpen(true);
                }}
                className="bg-[#065F46] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#047857] transition-all flex items-center gap-3 shadow-xl shadow-emerald-900/10 active:scale-95"
              >
                <Camera className="w-5 h-5" /> Open Camera
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 relative z-10"
            >
              <div className="relative rounded-[32px] overflow-hidden bg-[#F5F2EB] aspect-video md:aspect-[16/9] flex items-center justify-center border border-[#E5E1D8] group">
                <img
                  src={image}
                  alt="Specimen"
                  className="w-full h-full object-cover"
                />

                {/* Scanning Animation Overlay */}
                {isAnalyzing && (
                  <motion.div
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] z-20"
                  />
                )}

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setImage(null)}
                    className="bg-white text-red-600 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <button
                onClick={analyzePlant}
                disabled={isAnalyzing}
                className="w-full bg-[#065F46] hover:bg-[#047857] disabled:bg-slate-300 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 fill-current" />
                    Run Diagnostic
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-start gap-4 text-red-800 shadow-sm"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-lg">Analysis Interrupted</h4>
            <p className="text-sm font-medium opacity-90 mt-1">{error}</p>
            <button
              onClick={analyzePlant}
              className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white border border-red-100 px-4 py-2 rounded-xl shadow-sm hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Analysis
            </button>
          </div>
        </motion.div>
      )}

      {/* Instructional Tips */}
      <div className="bg-[#FDFCF9] rounded-[32px] p-8 border border-[#E5E1D8]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-black text-[#1A202C] text-xl">
            For Best Results
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          {DIAGNOSTIC_TIPS.map((tip, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50/50 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm font-bold text-[#4A5568]">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
