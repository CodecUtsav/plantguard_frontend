import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Note: corrected import from 'motion/react'
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

// --- Sub-components for better performance and readability ---

const HistoryItem = React.memo(
  ({
    item,
    onDelete,
    onView,
  }: {
    item: any;
    onDelete: (id: string) => void;
    onView: (item: any) => void;
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all"
    >
      <div className="flex p-3 gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F5F2EB] shrink-0">
          <img
            src={item.image}
            alt="Scan"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-center gap-1.5 text-[#718096] mb-1">
            <Calendar className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {item.date}
            </span>
          </div>
          <h4 className="font-bold text-[#1A202C] truncate">
            {item.result.disease}
          </h4>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => onView(item)}
              className="text-[10px] font-black text-[#065F46] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
            >
              View Report <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(item.id!)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  ),
);

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

  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    setIsStatsLoading(true);
    try {
      const res = await fetch("/api/user/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch user stats", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (showHistory && activeTab === "insights" && !stats) {
      fetchUserStats();
    }
  }, [showHistory, activeTab, stats, fetchUserStats]);

  const deleteHistoryItem = useCallback(
    async (id: string) => {
      if (!user) {
        setHistory(history.filter((h) => h.id !== id));
        return;
      }
      try {
        const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
        if (res.ok) {
          setHistory(history.filter((h) => h.id !== id));
          fetchUserStats();
        }
      } catch (err) {
        console.error("Deletion failed", err);
      }
    },
    [user, history, setHistory, fetchUserStats],
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
            {/* Header Section */}
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
                  className="p-2 hover:bg-[#F5F2EB] rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-[#4A5568]" />
                </button>
              </div>

              <div className="flex bg-[#F5F2EB] p-1 rounded-xl">
                {(["history", "insights"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                      activeTab === tab
                        ? "bg-white text-[#065F46] shadow-sm"
                        : "text-[#718096]"
                    }`}
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === "history" ? (
                  <motion.div
                    key="history-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {history.length === 0 ? (
                      <EmptyState
                        icon={<HistoryIcon />}
                        title="No diagnostics found"
                        subtitle="Your past scans will appear here"
                      />
                    ) : (
                      history.map((item) => (
                        <HistoryItem
                          key={item.id}
                          item={item}
                          onDelete={deleteHistoryItem}
                          onView={handleViewReport}
                        />
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="insights-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {!user ? (
                      <EmptyState
                        icon={<BarChart3 />}
                        title="Locked feature"
                        subtitle="Insights are available for registered users."
                      />
                    ) : isStatsLoading ? (
                      <LoadingState />
                    ) : stats ? (
                      <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <StatCard
                            label="Total Scans"
                            value={stats.totalDiagnostics}
                          />
                          <StatCard
                            label="Health Score"
                            value="84%"
                            color="text-emerald-600"
                          />
                        </div>

                        {/* Bar Chart */}
                        <ChartSection
                          icon={<Activity />}
                          title="Recent Activity"
                        >
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.dailyDiagnostics}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke="#F5F2EB"
                                />
                                <XAxis
                                  dataKey="_id"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{
                                    fontSize: 8,
                                    fontWeight: "bold",
                                    fill: "#A0AEC0",
                                  }}
                                />
                                <YAxis
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{
                                    fontSize: 8,
                                    fontWeight: "bold",
                                    fill: "#A0AEC0",
                                  }}
                                />
                                <Tooltip
                                  cursor={{ fill: "#F0FDF4" }}
                                  contentStyle={tooltipStyle}
                                />
                                <Bar
                                  dataKey="count"
                                  fill="#10B981"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </ChartSection>

                        {/* Pie Chart */}
                        <ChartSection
                          icon={<PieChartIcon />}
                          title="Disease Breakdown"
                        >
                          <div className="h-48 flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={stats.diseaseStats}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="count"
                                  nameKey="_id"
                                >
                                  {stats.diseaseStats.map(
                                    (_: any, index: number) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                      />
                                    ),
                                  )}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="w-32 space-y-1">
                              {stats.diseaseStats.map(
                                (entry: any, index: number) => (
                                  <LegendItem
                                    key={entry._id}
                                    color={COLORS[index % COLORS.length]}
                                    label={entry._id}
                                    count={entry.count}
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        </ChartSection>

                        {/* AI Tip */}
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 ring-1 ring-emerald-200/50">
                          <div className="flex items-center gap-2 text-emerald-700 mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              AI Recommendation
                            </span>
                          </div>
                          <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                            Your garden shows a trend of fungal issues. Increase
                            air circulation and avoid watering after sunset.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={<BarChart3 />}
                        title="No data to analyze yet"
                        subtitle="Start scanning your plants to see trends"
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

// --- Reusable UI Atoms ---

const StatCard = ({ label, value, color = "text-[#1A202C]" }: any) => (
  <div className="bg-[#FDFCF9] p-4 rounded-2xl border border-[#E5E1D8]">
    <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest mb-1">
      {label}
    </p>
    <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
  </div>
);

const ChartSection = ({ icon, title, children }: any) => (
  <div className="space-y-4">
    <h4 className="font-bold text-sm text-[#1A202C] flex items-center gap-2">
      <span className="text-emerald-600">{icon}</span>
      {title}
    </h4>
    {children}
  </div>
);

const LegendItem = ({ color, label, count }: any) => (
  <div className="flex items-center justify-between text-[8px] font-bold">
    <div className="flex items-center gap-1.5 min-w-0">
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-[#4A5568] truncate">{label}</span>
    </div>
    <span className="text-[#718096]">{count}</span>
  </div>
);

const LoadingState = () => (
  <div className="h-64 flex flex-col items-center justify-center text-emerald-600 gap-4">
    <Loader2 className="w-12 h-12 animate-spin" />
    <p className="font-bold uppercase tracking-widest text-[10px] text-center">
      Crunching garden data...
    </p>
  </div>
);

const EmptyState = ({ icon, title, subtitle }: any) => (
  <div className="py-20 flex flex-col items-center justify-center text-center opacity-40 grayscale">
    <div className="w-16 h-16 mb-4">{icon}</div>
    <p className="font-bold">{title}</p>
    <p className="text-xs mt-1">{subtitle}</p>
  </div>
);

const tooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  fontSize: "10px",
  fontWeight: "bold",
};
