import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  History as HistoryIcon,
  ChevronRight,
  Calendar,
  Trash2,
  BarChart3,
  Activity,
  PieChart as PieChartIcon,
  TrendingUp,
  Loader2,
  ShieldCheck,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useStore } from "../store/useStore";

const API_BASE = import.meta.env.VITE_API_URL;

// --- Helper for Tooltip Style ---
const tooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  fontSize: "10px",
  fontWeight: "bold",
};

export const History: React.FC = () => {
  const {
    showHistory,
    setShowHistory,
    history,
    setResult,
    setImage,
    user,
    setHistory,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"history" | "insights">("history");
  const [stats, setStats] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const COLORS = useMemo(
    () => ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"],
    [],
  );

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/history`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setHistory(data.history);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }, [user, setHistory]);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    setIsStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/stats`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch user stats", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
      if (activeTab === "insights") fetchUserStats();
    }
  }, [showHistory, activeTab, fetchHistory, fetchUserStats]);

  const deleteHistoryItem = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_BASE}/api/history/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setHistory(history.filter((h) => h._id !== id));
          if (activeTab === "insights") fetchUserStats();
        }
      } catch (err) {
        console.error("Deletion failed", err);
      }
    },
    [history, setHistory, fetchUserStats, activeTab],
  );

  const handleViewReport = (item: any) => {
    setResult(item.result);
    setImage(item.image);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {showHistory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistory(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
          >
            <header className="p-6 border-b border-[#E5E1D8] bg-[#FDFCF9]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
                    <HistoryIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-[#1A202C]">
                    My Garden
                  </h2>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              <div className="flex bg-[#F5F2EB] p-1 rounded-xl">
                {(["history", "insights"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? "bg-white text-[#065F46] shadow-sm" : "text-[#718096]"}`}
                  >
                    {tab === "history" ? (
                      <HistoryIcon className="w-4 h-4" />
                    ) : (
                      <BarChart3 className="w-4 h-4" />
                    )}
                    {tab}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === "history" ? (
                  <motion.div
                    key="h-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {history.length === 0 ? (
                      <EmptyState
                        icon={<HistoryIcon />}
                        title="No scans yet"
                        subtitle="Diagnostics will appear here"
                      />
                    ) : (
                      history.map((item) => (
                        <HistoryItem
                          key={item._id}
                          item={item}
                          onDelete={deleteHistoryItem}
                          onView={handleViewReport}
                        />
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="i-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {!user ? (
                      <EmptyState
                        icon={<BarChart3 />}
                        title="Login Required"
                        subtitle="Insights are for members."
                      />
                    ) : isStatsLoading ? (
                      <LoadingState />
                    ) : stats ? (
                      <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                          <StateCard
                            label="Total Scans"
                            value={stats.totalDiagnostics || 0}
                            icon={Activity}
                            color="emerald"
                          />
                          <StateCard
                            label="Health Score"
                            value="92%"
                            icon={ShieldCheck}
                            color="blue"
                            trend="+2%"
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />{" "}
                            Activity Trend
                          </h4>
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.dailyDiagnostics}>
                                <XAxis dataKey="_id" hide />
                                <Tooltip
                                  contentStyle={tooltipStyle}
                                  cursor={{ fill: "#f8fafc" }}
                                />
                                <Bar
                                  dataKey="count"
                                  fill="#10b981"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={<PieChartIcon />}
                        title="No Data"
                        subtitle="Scan plants to see analytics."
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- FIXED STATE CARD ---
interface StateCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  color?: "emerald" | "blue" | "amber" | "rose" | "slate";
  trend?: string;
}

export const StateCard: React.FC<StateCardProps> = ({
  label,
  value,
  icon: Icon,
  color = "slate",
  trend,
}) => {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    rose: "text-rose-600 bg-rose-50",
    slate: "text-slate-600 bg-slate-50",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        {Icon && (
          <div className={`p-1.5 rounded-xl ${colorMap[color].split(" ")[1]}`}>
            <Icon className={`w-3.5 h-3.5 ${colorMap[color].split(" ")[0]}`} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black tracking-tight text-slate-900">
          {value}
        </h3>
        {trend && (
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
};

// --- OTHER ATOMS ---
export const LoadingState: React.FC<{ label?: string }> = ({
  label = "Loading data...",
}) => (
  <div className="h-64 flex flex-col items-center justify-center text-emerald-600 gap-4">
    <Loader2 className="w-10 h-10 animate-spin stroke-[1.5px]" />
    <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">
      {label}
    </p>
  </div>
);

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => (
  <div className="py-16 flex flex-col items-center justify-center text-center opacity-40">
    <div className="w-16 h-16 mb-4 text-slate-300">
      {React.cloneElement(icon as React.ReactElement, {
        className: "w-full h-full stroke-[1px]",
      })}
    </div>
    <p className="font-bold text-slate-900">{title}</p>
    <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
  </div>
);

export const HistoryItem = React.memo(
  ({ item, onDelete, onView }: HistoryItemProps) => {
    const isHighConfidence = item.result.confidence > 0.7;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-white border border-slate-100 rounded-2xl p-3 flex gap-4 hover:border-emerald-200 transition-all"
      >
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0">
          <img
            src={item.image}
            alt="Scan"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {item.date}
              </span>
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${isHighConfidence ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
              >
                {isHighConfidence ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span className="text-[9px] font-black">
                  {(item.result.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <h4 className="font-bold text-slate-900 truncate mt-1">
              {item.result.disease}
            </h4>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => onView(item)}
              className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1 hover:translate-x-1 transition-transform"
            >
              View <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item._id);
              }}
              className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  },
);
