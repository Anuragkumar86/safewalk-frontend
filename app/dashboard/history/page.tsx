"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Calendar, Clock, ShieldCheck, AlertTriangle, ChevronRight, Lock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

type Walk = {
  id: string | number;
  startTime?: string | number;
  endTime?: string | number | null;
  status?: "SAFE" | "DANGER" | "IN_PROGRESS" | string;
  durationMinutes?: number | null;
  notes?: string | null;
};

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Replacement for session
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!savedToken || !savedUser) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<Walk[]>(`${process.env.NEXT_PUBLIC_API_URL}/walk/history`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("History fetch error", err);
        setError("Unable to load history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (when?: string | number) => {
    if (!when) return "—";
    try {
      return format(new Date(when), "PPP");
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (when?: string | number) => {
    if (!when) return "—";
    try {
      return format(new Date(when), "p");
    } catch {
      return "—";
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case "SAFE":
        return <ShieldCheck size={18} className="text-emerald-500" />;
      case "DANGER":
        return <AlertTriangle size={18} className="text-rose-500" />;
      default:
        return <Clock size={18} className="text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-6">
        <div className="h-12 w-12 rounded-full border-4 border-rose-600 border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Loading your history...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }}
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
          <Lock className="text-rose-500" size={44} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">History Locked</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium leading-relaxed">
          Walk history is only visible to verified users. Please sign in to view your safety logs.
        </p>
        <button onClick={() => router.push("/login")} className="flex items-center gap-3 bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold shadow-md">
          Login to Continue <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }} className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 px-4">

      <div className="max-w-xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Journey Logs</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Your safety record</p>
        </header>

        {error && <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm font-bold">{error}</div>}

        {history.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-50 text-slate-300 mb-3">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No logs found</h3>
            <p className="mt-2 text-sm text-slate-500">Start a safe walk to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((walk) => (
              <article key={walk.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  {statusBadge(walk.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(walk.startTime)}
                  </p>
                  <h3 className="text-base font-bold text-slate-800 truncate">{walk.status === "SAFE" ? "Walk Completed" : "Emergency Alert"}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(walk.startTime)}</span>
                    {walk.durationMinutes && <span>• {walk.durationMinutes}m</span>}
                  </div>
                </div>

                <ChevronRight size={20} className="text-slate-300" />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}