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
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { useStore } from "../store/useStore";

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

  const fetchData = useCallback(async () => {
    if (!showAdminPanel) return;
    setIsAdminLoading(true);
    try {
      const options = { credentials: "include" as const };
      const [uRes, sRes, supRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, options),
        fetch(`${API_BASE}/api/admin/stats`, options),
        fetch(`${API_BASE}/api/admin/support`, options),
      ]);

      const uData = await uRes.json();
      const sData = await sRes.json();
      const supData = await supRes.json();

      if (uData.success) setAdminUsers(uData.users);
      if (sData.success) setStats(sData.stats);
      if (supData.success) setSupportRequests(supData.requests);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsAdminLoading(false);
    }
  }, [showAdminPanel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateUser = async (id: string, payload: object) => {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if ((await res.json()).success) {
      setAdminUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...payload } : u)),
      );
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if ((await res.json()).success) {
      setAdminUsers((prev) => prev.filter((u) => u._id !== id));
      setDeletingUserId(null);
    }
  };

  const handleSupportStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/api/admin/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if ((await res.json()).success) {
      setSupportRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r)),
      );
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
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-6xl h-full max-h-[850px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-emerald-100"
          >
            <header className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-white">
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
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto bg-slate-50/50">
              <AnimatePresence mode="wait">
                {activeTab === "users" && (
                  <motion.div
                    key="u"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 space-y-6"
                  >
                    <div className="relative max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl outline-none"
                      />
                    </div>
                    <table className="w-full border-separate border-spacing-y-2">
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
                  </motion.div>
                )}

                {activeTab === "insights" && (
                  <motion.div
                    key="i"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {stats && (
                      <>
                        <StateCard
                          label="Total Users"
                          value={stats.totalUsers}
                          icon={Users}
                          color="emerald"
                        />
                        <StateCard
                          label="Circulating Credits"
                          value={stats.totalCredits}
                          icon={Coins}
                          color="amber"
                        />
                        <StateCard
                          label="Tickets"
                          value={supportRequests.length}
                          icon={MessageSquare}
                          color="blue"
                        />
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === "support" && (
                  <motion.div
                    key="s"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 space-y-4"
                  >
                    {supportRequests.map((req) => (
                      <SupportCard
                        key={req._id}
                        req={req}
                        onResolve={handleSupportStatus}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Sub-Components ---

const UserRow = ({
  user,
  onUpdate,
  deletingId,
  setDeletingId,
  onDelete,
}: any) => (
  <tr className="bg-white hover:bg-emerald-50/20 shadow-sm transition-all">
    <td className="px-6 py-4 rounded-l-2xl border-l border-y border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-sm">{user.name}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-center border-y border-slate-100">
      <select
        value={user.role}
        onChange={(e) => onUpdate(user._id, { role: e.target.value })}
        className="bg-slate-50 text-[10px] font-bold p-2 rounded-lg outline-none"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </td>
    <td className="px-6 py-4 text-center border-y border-slate-100 font-bold text-sm">
      {user.credits}
    </td>
    <td className="px-6 py-4 text-right rounded-r-2xl border-r border-y border-slate-100">
      {deletingId === user._id ? (
        <button
          onClick={() => onDelete(user._id)}
          className="text-red-600 font-bold text-xs uppercase"
        >
          Confirm
        </button>
      ) : (
        <button
          onClick={() => setDeletingId(user._id)}
          className="text-slate-300 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </td>
  </tr>
);

const SupportCard = ({ req, onResolve }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-bold text-slate-900">{req.subject}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase">
          {req.name} • {req.email}
        </p>
      </div>
      <span
        className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${req.status === "resolved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600 animate-pulse"}`}
      >
        {req.status}
      </span>
    </div>
    <p className="text-xs text-slate-600 italic bg-slate-50 p-4 rounded-2xl">
      "{req.message}"
    </p>
    {req.status === "pending" && (
      <button
        onClick={() => onResolve(req._id, "resolved")}
        className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-700"
      >
        <CheckCircle2 className="w-4 h-4" /> Resolve Ticket
      </button>
    )}
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${active ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-50"}`}
  >
    <Icon className="w-3 h-3" /> {label}
  </button>
);

const StateCard = ({ label, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    blue: "text-blue-600 bg-blue-50",
  };
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        {Icon && (
          <div className={`p-2 rounded-xl ${colorMap[color].split(" ")[1]}`}>
            <Icon className={`w-4 h-4 ${colorMap[color].split(" ")[0]}`} />
          </div>
        )}
      </div>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
  );
};

const LoadingPlaceholder = ({ label }: any) => (
  <div className="h-64 flex flex-col items-center justify-center text-emerald-600 gap-4">
    <Loader2 className="w-8 h-8 animate-spin" />
    <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
  </div>
);
