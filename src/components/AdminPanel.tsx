import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Users,
  Search,
  Loader2,
  Coins,
  Activity,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowUpRight,
  PieChart as PieChartIcon,
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

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];
const CHART_TOOLTIP_STYLE = {
  borderRadius: "16px",
  border: "none",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  fontSize: "12px",
  fontWeight: "bold",
};

// Replace with your actual backend URL from .env
const API_BASE = import.meta.env.VITE_API_URL;

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
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // --- Data Fetching (Synced with Backend Pattern) ---
  const fetchData = useCallback(async () => {
    if (!showAdminPanel) return;
    setIsAdminLoading(true);
    try {
      const [usersRes, statsRes, supportRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${API_BASE}/api/admin/stats`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${API_BASE}/api/admin/support`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      const supportData = await supportRes.json();

      console.log(usersData.users);

      if (usersData.success) setAdminUsers(usersData.users);
      if (statsData.success) setStats(statsData.stats);
      if (supportData.success) setSupportRequests(supportData.requests);
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
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, ...payload } : u)),
        );
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers((prev) => prev.filter((u) => u._id !== id));
        setDeletingUserId(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

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
            className="absolute inset-0 bg-[#065F46]/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            className="relative w-full max-w-6xl h-full max-h-[850px] bg-white rounded-[32px] md:rounded-[48px] shadow-2xl flex flex-col overflow-hidden border border-emerald-100"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <Shield className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    System Command
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
                      icon={Activity}
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
                className="absolute top-6 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              <AnimatePresence mode="wait">
                {activeTab === "users" && (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 space-y-6"
                  >
                    <div className="relative max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search identity or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>

                    {isAdminLoading ? (
                      <LoadingPlaceholder label="Syncing with user database..." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                          <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
                              <th className="px-6 py-2">Profile</th>
                              <th className="px-6 py-2 text-center">Role</th>
                              <th className="px-6 py-2 text-center">Credits</th>
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
                            label="Total Users"
                            value={stats.totalUsers || 0}
                            icon={Users}
                            color="blue"
                            trend="+5%"
                          />
                          <StatBox
                            label="System Credits"
                            value={stats.totalCredits || 0}
                            icon={Coins}
                            color="amber"
                            sub="Circulating Balance"
                          />
                          <StatBox
                            label="Admin Count"
                            value={
                              adminUsers.filter((u) => u.role === "admin")
                                .length
                            }
                            icon={Shield}
                            color="purple"
                          />
                        </div>
                        {/* Add Chart Components here using the same pattern as your original code */}
                      </>
                    ) : (
                      <LoadingPlaceholder label="Calculating metrics..." />
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

// --- Updated Sub-Components ---

const UserRow = ({
  user,
  onUpdate,
  deletingId,
  setDeletingId,
  onDelete,
}: any) => (
  <tr className="bg-white hover:bg-emerald-50/20 transition-all group shadow-sm">
    <td className="px-6 py-4 rounded-l-2xl border-y border-l border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm uppercase">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-sm text-slate-900">{user.name}</p>
          <p className="text-[11px] font-medium text-slate-400">{user.email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-center border-y border-slate-100">
      <select
        value={user.role}
        onChange={(e) => onUpdate(user._id, { role: e.target.value })}
        className="bg-slate-50 border-none rounded-lg text-[10px] font-black uppercase tracking-wider px-3 py-1.5 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </td>
    <td className="px-6 py-4 text-center border-y border-slate-100">
      <div className="flex items-center justify-center gap-2">
        <input
          type="number"
          value={user.credits}
          onChange={(e) =>
            onUpdate(user._id, { credits: parseInt(e.target.value) || 0 })
          }
          className="w-16 bg-slate-50 border-none rounded-lg text-xs font-bold px-2 py-1.5 focus:ring-2 focus:ring-emerald-500/20 outline-none text-center"
        />
      </div>
    </td>
    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-slate-100 text-right">
      {deletingId === user._id ? (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onDelete(user._id)}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => setDeletingId(null)}
            className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter"
          >
            Cancel
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

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
      active
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

const StatBox = ({ label, value, icon: Icon, color, trend, sub }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
    <div
      className={`absolute -right-4 -top-4 w-20 h-20 bg-${color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform`}
    />
    <div className="relative z-10 flex items-center gap-4 mb-4">
      <div
        className={`w-12 h-12 bg-${color}-50 rounded-2xl flex items-center justify-center text-${color}-600`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-2 text-[11px] font-black text-emerald-600">
        <ArrowUpRight className="w-3.5 h-3.5" />
        <span>{trend} Growth</span>
      </div>
    )}
  </div>
);

const LoadingPlaceholder = ({ label }: { label: string }) => (
  <div className="h-64 flex flex-col items-center justify-center text-emerald-600 gap-4 opacity-70">
    <Loader2 className="w-10 h-10 animate-spin" />
    <p className="font-black uppercase tracking-widest text-[10px]">{label}</p>
  </div>
);
