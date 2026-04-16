import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  AlertCircle,
  FileText,
  RefreshCw,
  Leaf,
  ShieldCheck,
  Info,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { useStore } from "../store/useStore";

/**
 * Helper function to handle PDF generation logic
 * Kept in the same file as requested.
 */
const handlePDFDownload = (result: any, image: string | null) => {
  if (!result) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background & Header
  doc.setFillColor(253, 252, 249);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFillColor(6, 95, 70);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PLANTGUARD DIAGNOSTIC", 20, 25);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `REPORT ID: PG-${Math.random().toString(36).toUpperCase().slice(-6)}`,
    20,
    35,
  );
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 50, 35);

  let yPos = 60;

  // Render Image if exists
  if (image) {
    try {
      const format = image.includes("png") ? "PNG" : "JPEG";
      doc.addImage(image, format, 20, yPos, 50, 50);
      yPos += 60;
    } catch (e) {
      console.error("PDF Image Error:", e);
    }
  }

  // Section Rendering Helper
  const renderSection = (
    title: string,
    content: string,
    color = [26, 32, 44],
  ) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(6, 95, 70);
    doc.text(title.toUpperCase(), 20, yPos);
    yPos += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(
      content.replace(/[#*]/g, ""),
      pageWidth - 40,
    );
    doc.text(lines, 20, yPos);
    yPos += lines.length * 5 + 12;
  };

  renderSection("Identified Condition", result.disease, [16, 185, 129]);
  renderSection("Current Status", result.status);
  renderSection("Primary Cause", result.cause);
  renderSection("Treatment Plan", result.treatment);
  renderSection("Long-term Care", result.longTermCare);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "© 2026 PlantGuard AI - Professional Agriculture Science",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" },
  );

  doc.save(`PlantGuard_${result.disease.replace(/\s+/g, "_")}.pdf`);
};

export const DiagnosticResult: React.FC = () => {
  const { result, isAnalyzing, loadingMessage, image } = useStore();

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] p-12 shadow-xl border border-[#E5E1D8] flex flex-col items-center justify-center text-center gap-8 min-h-[500px]"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-[5px] border-[#F0FDF4] border-t-emerald-500 rounded-full"
          />
          <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-black text-2xl text-slate-800">
            {loadingMessage}
          </h3>
          <p className="text-slate-500 font-medium text-sm">
            Cross-referencing global plant pathology databases...
          </p>
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-[32px] shadow-2xl border border-[#E5E1D8] overflow-hidden h-full flex flex-col"
    >
      {/* Header Bar */}
      <div className="p-6 md:p-8 border-b border-[#F5F2EB] bg-emerald-50/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100">
            <ShieldCheck className="text-emerald-600 w-7 h-7" />
          </div>
          <h2 className="font-black text-lg text-emerald-900">
            Diagnostic Report
          </h2>
        </div>
        <button
          onClick={() => handlePDFDownload(result, image)}
          className="bg-white p-3 rounded-xl border border-[#E5E1D8] text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm flex items-center gap-2 text-xs font-black uppercase tracking-wider"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* Main Analysis Body */}
      <div className="p-6 md:p-8 space-y-10 flex-grow overflow-y-auto">
        <section>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">
            Detected Pathogen
          </label>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            {result.disease}
          </h3>

          {/* Confidence Meter */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: result.confidence }}
                className="h-full bg-emerald-500"
              />
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase italic">
              {result.confidence} Match
            </span>
          </div>

          <div className="mt-6 p-5 bg-emerald-50 rounded-2xl border border-emerald-100/50">
            <p className="text-sm text-emerald-900 font-semibold leading-relaxed">
              {result.status}
            </p>
          </div>
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard
            icon={AlertCircle}
            title="Primary Cause"
            content={result.cause}
          />
          <InfoCard
            icon={ShieldCheck}
            title="Prevention"
            content={result.precautions}
          />
        </div>

        {/* Treatment Protocol */}
        <div className="bg-[#FDFCF9] rounded-3xl p-6 border border-[#E5E1D8] shadow-sm">
          <h4 className="font-black text-emerald-800 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Treatment Protocol
          </h4>
          <div className="text-sm text-slate-600 leading-relaxed prose prose-emerald max-w-none prose-p:font-medium">
            <ReactMarkdown>{result.treatment}</ReactMarkdown>
          </div>
        </div>

        {/* Long Term Care */}
        <div className="bg-[#FDFCF9] rounded-3xl p-6 border border-[#E5E1D8] shadow-sm">
          <h4 className="font-black text-emerald-800 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
            <RefreshCw className="w-4 h-4" />
            Maintenance & Recovery
          </h4>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            {result.longTermCare}
          </p>
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="p-6 bg-slate-50 border-t border-[#E5E1D8] flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
          This AI-generated analysis is for informational support. For
          commercial agricultural operations, verify results with a certified
          agronomist.
        </p>
      </div>
    </motion.div>
  );
};

// Reusable Sub-component for the grid
const InfoCard = ({ icon: Icon, title, content }: any) => (
  <div className="p-6 bg-[#FDFCF9] rounded-2xl border border-[#E5E1D8] flex flex-col gap-2">
    <div className="flex items-center gap-2 text-emerald-800 opacity-80">
      <Icon className="w-4 h-4" />
      <h4 className="font-black text-[10px] uppercase tracking-widest">
        {title}
      </h4>
    </div>
    <p className="text-sm text-slate-600 font-bold leading-relaxed">
      {content}
    </p>
  </div>
);
