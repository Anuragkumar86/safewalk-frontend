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
      // 1. Get auth data from localStorage
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

        // 2. Fetch using the manual token
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

  // --- 1. Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="h-12 w-12 rounded-full border-4 border-rose-600 border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Loading your history...</p>
      </div>
    );
  }

  // --- 2. Unauthenticated State (No user in localStorage) ---
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8">
          <Lock className="text-rose-500" size={44} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">History Locked</h2>
        <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">
          Walk history is only visible to verified users. Please sign in to view your safety logs.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-3 bg-rose-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-rose-200"
        >
          Login to Continue <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-20 px-4">
      <div className="max-w-xl mx-auto">
        <header className="mb-8 ml-2">
          <h1 className="text-3xl font-black text-slate-900">Journey Logs</h1>
          <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-tighter">
            Your safety record
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-sm font-bold">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-slate-50 text-slate-300 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No logs found</h3>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Start a safe walk to see your history here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((walk) => (
              <article
                key={walk.id}
                className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-50 active:scale-[0.98] transition-transform flex items-center gap-4"
              >
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                  {statusBadge(walk.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Calendar size={10} /> {formatDate(walk.startTime)}
                  </p>
                  <h3 className="text-base font-bold text-slate-800 truncate">
                    {walk.status === "SAFE" ? "Walk Completed" : "Emergency Alert"}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1">
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