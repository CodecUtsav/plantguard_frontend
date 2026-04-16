import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Users,
  Search,
  Loader2,
  Coins,
  Check,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useStore } from "../store/useStore";

// --- Shared Constants ---
const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];
const CHART_TOOLTIP_STYLE = {
  borderRadius: "16px",
  border: "none",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  fontSize: "12px",
  fontWeight: "bold",
};

export const AdminPanel: React.FC = () => {
  const { showAdminPanel, setShowAdminPanel } = useStore();
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "insights" | "support">(
    "users",
  );
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [isSupportLoading, setIsSupportLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (!showAdminPanel) return;
    setIsAdminLoading(true);
    try {
      const [usersRes, statsRes, supportRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/support"),
      ]);

      if (usersRes.ok) setAdminUsers(await usersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (supportRes.ok) setSupportRequests(await supportRes.json());
    } catch (err) {
      console.error("Admin Refresh Failed", err);
    } finally {
      setIsAdminLoading(false);
    }
  }, [showAdminPanel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Mutations ---
  const handleUpdateUser = async (id: string, payload: object) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setAdminUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, ...payload } : u)),
        );
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleSupportStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSupportRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status } : r)),
        );
      }
    } catch (err) {
      console.error("Support update failed", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAdminUsers((prev) => prev.filter((u) => u._id !== id));
        setDeletingUserId(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // --- Filtered Data ---
  const filteredUsers = useMemo(
    () =>
      adminUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [adminUsers, searchQuery],
  );

  return (
    <AnimatePresence>
      {showAdminPanel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdminPanel(false)}
            className="absolute inset-0 bg-[#065F46]/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            className="relative w-full max-w-6xl h-full max-h-[850px] bg-white rounded-[32px] md:rounded-[48px] shadow-2xl flex flex-col overflow-hidden border border-emerald-100"
          >
            {/* --- Header --- */}
            <div className="px-8 py-6 border-b border-[#F5F2EB] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#FDFCF9]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <Shield className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#1A202C]">
                    Admin Panel
                  </h2>
                  <nav className="flex items-center gap-4 mt-1">
                    <TabButton
                      active={activeTab === "users"}
                      onClick={() => setActiveTab("users")}
                      icon={Users}
                      label="Users"
                    />
                    <TabButton
                      active={activeTab === "insights"}
                      onClick={() => setActiveTab("insights")}
                      icon={BarChart3}
                      label="Insights"
                    />
                    <TabButton
                      active={activeTab === "support"}
                      onClick={() => setActiveTab("support")}
                      icon={MessageSquare}
                      label="Support"
                    />
                  </nav>
                </div>
              </div>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="absolute top-6 right-8 p-2 hover:bg-[#F5F2EB] rounded-full transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex-1 overflow-y-auto bg-[#FDFCF9] custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === "users" && (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 space-y-6"
                  >
                    <div className="relative max-w-md shadow-sm">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Filter by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-6 py-3.5 bg-white border border-[#E5E1D8] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                      />
                    </div>

                    {isAdminLoading ? (
                      <LoadingPlaceholder label="Accessing user vault..." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                          <thead>
                            <tr className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">
                              <th className="px-6 py-2">Account</th>
                              <th className="px-6 py-2 text-center">
                                Permissions
                              </th>
                              <th className="px-6 py-2 text-center">Balance</th>
                              <th className="px-6 py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((u) => (
                              <UserRow
                                key={u._id}
                                user={u}
                                onUpdate={handleUpdateUser}
                                deletingId={deletingUserId}
                                setDeletingId={setDeletingUserId}
                                onDelete={handleDeleteUser}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "insights" && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 space-y-8"
                  >
                    {stats ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <StatBox
                            label="Total Gardeners"
                            value={stats.totalUsers}
                            icon={Users}
                            color="blue"
                            trend="+12%"
                          />
                          <StatBox
                            label="Diagnostic Runs"
                            value={stats.totalDiagnostics}
                            icon={Activity}
                            color="emerald"
                            trend="+24%"
                          />
                          <StatBox
                            label="Est. Platform Revenue"
                            value={`₹${stats.totalDiagnostics * 39}`}
                            icon={Coins}
                            color="amber"
                            sub="Based on scan volume"
                          />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <ChartWrapper
                            icon={Calendar}
                            title="Weekly Diagnosis Volume"
                          >
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
                                    fontSize: 10,
                                    fontWeight: "bold",
                                    fill: "#A0AEC0",
                                  }}
                                />
                                <YAxis
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{
                                    fontSize: 10,
                                    fontWeight: "bold",
                                    fill: "#A0AEC0",
                                  }}
                                />
                                <Tooltip
                                  contentStyle={CHART_TOOLTIP_STYLE}
                                  cursor={{ fill: "#F0FDF4" }}
                                />
                                <Bar
                                  dataKey="count"
                                  fill="#10B981"
                                  radius={[6, 6, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartWrapper>

                          <ChartWrapper
                            icon={PieChartIcon}
                            title="Pathology Distribution"
                          >
                            <div className="h-full flex items-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={stats.diseaseStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                  >
                                    {stats.diseaseStats.map(
                                      (_: any, i: number) => (
                                        <Cell
                                          key={i}
                                          fill={COLORS[i % COLORS.length]}
                                        />
                                      ),
                                    )}
                                  </Pie>
                                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="w-40 space-y-2">
                                {stats.diseaseStats.map(
                                  (entry: any, i: number) => (
                                    <LegendItem
                                      key={entry._id}
                                      color={COLORS[i % COLORS.length]}
                                      label={entry._id}
                                      count={entry.count}
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          </ChartWrapper>
                        </div>
                      </>
                    ) : (
                      <LoadingPlaceholder label="Crunching system data..." />
                    )}
                  </motion.div>
                )}

                {activeTab === "support" && (
                  <motion.div
                    key="support"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 space-y-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-[#1A202C]">
                        Active Support Queue
                      </h3>
                      <button
                        onClick={fetchData}
                        className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all"
                      >
                        <RefreshCwIcon isAnimating={isSupportLoading} />
                      </button>
                    </div>

                    {supportRequests.length === 0 ? (
                      <EmptyState
                        icon={MessageSquare}
                        label="All quiet in support"
                        sub="No pending requests found."
                      />
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {supportRequests.map((req) => (
                          <SupportCard
                            key={req._id}
                            req={req}
                            onResolve={handleSupportStatus}
                          />
                        ))}
                      </div>
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

// --- Sub-Components & UI Atoms ---

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
      active
        ? "bg-emerald-50 text-emerald-700 shadow-sm"
        : "text-slate-400 hover:text-slate-600"
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

const UserRow = ({
  user,
  onUpdate,
  deletingId,
  setDeletingId,
  onDelete,
}: any) => (
  <tr className="bg-white hover:bg-emerald-50/30 transition-colors group border-y border-[#F5F2EB]">
    <td className="px-6 py-4 rounded-l-2xl border-l border-[#F5F2EB]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-sm text-[#1A202C]">{user.name}</p>
          <p className="text-[11px] font-medium text-[#718096]">{user.email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-center">
      <select
        value={user.role}
        onChange={(e) => onUpdate(user._id, { role: e.target.value })}
        className="bg-[#F5F2EB] border-none rounded-lg text-[10px] font-black uppercase tracking-wider px-3 py-1.5 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </td>
    <td className="px-6 py-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <Coins className="w-3.5 h-3.5 text-amber-500" />
        <input
          type="number"
          value={user.credits}
          onChange={(e) =>
            onUpdate(user._id, { credits: parseInt(e.target.value) || 0 })
          }
          className="w-14 bg-[#F5F2EB] border-none rounded-lg text-xs font-bold px-2 py-1 focus:ring-2 focus:ring-emerald-500/20 outline-none text-center"
        />
      </div>
    </td>
    <td className="px-6 py-4 rounded-r-2xl border-r border-[#F5F2EB] text-right">
      {deletingId === user._id ? (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onDelete(user._id)}
            className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => setDeletingId(null)}
            className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter"
          >
            Exit
          </button>
        </div>
      ) : (
        <button
          onClick={() => setDeletingId(user._id)}
          className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </td>
  </tr>
);

const StatBox = ({ label, value, icon: Icon, color, trend, sub }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-[#E5E1D8] shadow-sm relative overflow-hidden group">
    <div
      className={`absolute -right-4 -top-4 w-20 h-20 bg-${color}-50 rounded-full blur-2xl group-hover:scale-150 transition-transform`}
    />
    <div className="relative z-10 flex items-center gap-4 mb-4">
      <div
        className={`w-12 h-12 bg-${color}-50 rounded-2xl flex items-center justify-center text-${color}-600`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-[#718096] uppercase tracking-[0.2em]">
          {label}
        </p>
        <h3 className="text-2xl font-black text-[#1A202C]">{value}</h3>
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-2 text-[11px] font-black text-emerald-600">
        <ArrowUpRight className="w-3.5 h-3.5" />
        <span>{trend} Growth</span>
      </div>
    )}
    {sub && (
      <p className="text-[10px] text-[#A0AEC0] font-medium italic">{sub}</p>
    )}
  </div>
);

const ChartWrapper = ({ icon: Icon, title, children }: any) => (
  <div className="bg-white p-8 rounded-[32px] border border-[#E5E1D8] shadow-sm flex flex-col">
    <h4 className="font-bold text-[#1A202C] mb-8 flex items-center gap-3">
      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
        <Icon className="w-4 h-4" />
      </div>
      {title}
    </h4>
    <div className="flex-1 h-64 min-h-[250px]">{children}</div>
  </div>
);

const LegendItem = ({ color, label, count }: any) => (
  <div className="flex items-center justify-between text-[11px] font-bold">
    <div className="flex items-center gap-2 min-w-0">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-[#4A5568] truncate">{label}</span>
    </div>
    <span className="text-emerald-600">{count}</span>
  </div>
);

const SupportCard = ({ req, onResolve }: any) => (
  <div className="bg-white p-6 rounded-[24px] border border-[#E5E1D8] shadow-sm space-y-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 text-xs">
          {req.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-sm text-[#1A202C] leading-none">
            {req.subject}
          </h4>
          <p className="text-[10px] font-medium text-[#718096] mt-1">
            {req.name} • {req.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
          <Clock className="w-3 h-3" />
          {new Date(req.createdAt).toLocaleDateString()}
        </div>
        <span
          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
            req.status === "resolved"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600 animate-pulse"
          }`}
        >
          {req.status}
        </span>
      </div>
    </div>
    <p className="text-xs text-[#4A5568] leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
      {req.message}
    </p>
    {req.status === "pending" && (
      <button
        onClick={() => onResolve(req._id, "resolved")}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#065F46] hover:gap-3 transition-all"
      >
        <CheckCircle2 className="w-4 h-4" />
        Resolve Ticket
      </button>
    )}
  </div>
);

const LoadingPlaceholder = ({ label }: { label: string }) => (
  <div className="h-64 flex flex-col items-center justify-center text-emerald-600 gap-4 opacity-70">
    <Loader2 className="w-10 h-10 animate-spin" />
    <p className="font-black uppercase tracking-widest text-[10px]">{label}</p>
  </div>
);

const EmptyState = ({ icon: Icon, label, sub }: any) => (
  <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-3 grayscale opacity-50">
    <Icon className="w-12 h-12 stroke-[1.5px]" />
    <div className="text-center">
      <p className="font-black uppercase tracking-widest text-[11px]">
        {label}
      </p>
      <p className="text-[10px] font-medium">{sub}</p>
    </div>
  </div>
);

const RefreshCwIcon = ({ isAnimating }: { isAnimating: boolean }) => (
  <Activity className={`w-4 h-4 ${isAnimating ? "animate-spin" : ""}`} />
);
