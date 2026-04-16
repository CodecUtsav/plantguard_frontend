import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera as CameraIcon, RefreshCw, Zap, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";

export const CameraModal: React.FC = () => {
  const { isCameraOpen, setIsCameraOpen, setImage, setResult } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Helper to stop all tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    stopCamera(); // Ensure previous streams are cleared

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for metadata to load before showing video
        videoRef.current.onloadedmetadata = () => {
          setIsInitializing(false);
        };
      }
    } catch (err) {
      console.error("Camera access failed", err);
      alert(
        "Camera access denied. Please enable permissions in your browser settings.",
      );
      setIsCameraOpen(false);
    }
  }, [facingMode, setIsCameraOpen, stopCamera]);

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup on unmount
    return () => stopCamera();
  }, [isCameraOpen, startCamera, stopCamera]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Use actual video dimensions for capture
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Handle mirroring if using front camera
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setImage(dataUrl);
        setResult(null);
        setIsCameraOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isCameraOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative w-full h-full flex flex-col"
          >
            {/* Header Area */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-widest">
                    Live Scanner
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">
                    AI Analysis Ready
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCameraOpen(false)}
                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Preview */}
            <div className="flex-1 relative overflow-hidden bg-neutral-900 flex items-center justify-center">
              {isInitializing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
                    Waking up lens...
                  </p>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-500 ${isInitializing ? "opacity-0" : "opacity-100"} ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />

              {/* Viewfinder Overlay */}
              {!isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 sm:w-80 sm:h-80 border-2 border-white/20 rounded-[40px] relative">
                    {/* Corners */}
                    <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-emerald-500 rounded-tl-[24px]"></div>
                    <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-emerald-500 rounded-tr-[24px]"></div>
                    <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-emerald-500 rounded-bl-[24px]"></div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-emerald-500 rounded-br-[24px]"></div>

                    {/* Scanning Line */}
                    <motion.div
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] z-10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-8 sm:p-12 bg-neutral-950 flex flex-col items-center gap-8 relative">
              <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />

              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                Position leaf for diagnostic
              </p>

              <div className="flex items-center gap-10 sm:gap-16">
                <button
                  onClick={toggleCamera}
                  className="p-4 bg-neutral-800 rounded-full text-white hover:bg-neutral-700 transition-colors active:rotate-180 duration-500"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>

                <button
                  onClick={capturePhoto}
                  disabled={isInitializing}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-90 transition-transform disabled:opacity-50"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-neutral-200 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500 rounded-full shadow-inner"></div>
                  </div>
                </button>

                <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <CameraIcon className="w-6 h-6 text-white/20" />
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
