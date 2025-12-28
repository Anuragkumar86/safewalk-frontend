"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Calendar, Clock, ShieldCheck, AlertTriangle, ChevronRight, Lock, ArrowRight, History } from "lucide-react";
import { format } from "date-fns";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

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
  const [user, setUser] = useState<any>(null);
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

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backHandler = App.addListener('backButton', () => {
      router.replace('/dashboard');
    });

    return () => {
      backHandler.then(h => h.remove());
    };
  }, [router]);

  const formatDate = (when?: string | number) => {
    if (!when) return "—";
    try {
      return format(new Date(when), "MMM do, yyyy");
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

  // Enhanced helper for dynamic card styling
  const getStatusStyles = (status?: string) => {
    switch (status) {
      case "SAFE":
        return {
          card: "bg-emerald-950/30 border-emerald-500/20 hover:bg-emerald-900/40",
          iconBg: "bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
          icon: <ShieldCheck size={24} className="text-emerald-400" />,
          heading: "text-emerald-50",
          subtext: "text-emerald-400/70",
          metaBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
          chevron: "text-emerald-700"
        };
      case "DANGER":
        return {
          card: "bg-rose-950/40 border-rose-500/20 hover:bg-rose-900/50",
          iconBg: "bg-rose-500/20 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
          icon: <AlertTriangle size={24} className="text-rose-400" />,
          heading: "text-rose-50",
          subtext: "text-rose-400/70",
          metaBg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
          chevron: "text-rose-700"
        };
      default:
        return {
          card: "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900/80",
          iconBg: "bg-zinc-800/50 border-zinc-700/50 shadow-none",
          icon: <Clock size={24} className="text-zinc-400" />,
          heading: "text-zinc-100",
          subtext: "text-zinc-500",
          metaBg: "bg-zinc-800/50 text-zinc-400 border-zinc-700/30",
          chevron: "text-zinc-600"
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-zinc-800 border-t-rose-500 animate-spin"></div>
          <div className="absolute inset-0 blur-lg bg-rose-500/20 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-6 text-zinc-400 font-medium tracking-wide animate-pulse">Retrieving secure logs...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }}
        className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-zinc-950 text-zinc-100"
      >
        <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-8 rotate-3">
          <Lock className="text-rose-500" size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Access Restricted</h2>
        <p className="text-zinc-500 max-w-xs mb-10 leading-relaxed text-balance">
          Your safety history is encrypted. Please sign in to access your activity logs.
        </p>
        <button 
          onClick={() => router.push("/login")} 
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-rose-900/20"
        >
          Login to Continue <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{ paddingTop: "calc(env(safe-area-inset-top, 20px) + 45px)" }} 
      className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 px-5"
    >
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 mt-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500/10 rounded-lg">
                <History className="text-rose-500" size={20} />
            </div>
            <span className="text-rose-500 font-bold text-xs uppercase tracking-[0.2em]">Activity</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Journey Logs</h1>
          <p className="text-zinc-500 font-medium">Review your recent safety movements</p>
        </header>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-3">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center bg-zinc-900/50 backdrop-blur-xl p-12 rounded-[2rem] border border-zinc-800/50">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-zinc-800/50 text-zinc-600 mb-6">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-xl font-bold text-zinc-200">No journeys yet</h3>
            <p className="mt-3 text-zinc-500 max-w-[200px] mx-auto leading-relaxed">Your completed walks will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((walk) => {
              const styles = getStatusStyles(walk.status);
              
              return (
                <article 
                  key={walk.id} 
                  className={`group active:scale-[0.98] transition-all duration-200 backdrop-blur-md rounded-[1.75rem] p-5 border flex items-center gap-4 cursor-pointer ${styles.card}`}
                >
                  <div className={`shrink-0 transition-transform group-hover:scale-110 duration-300 h-12 w-12 rounded-2xl flex items-center justify-center border ${styles.iconBg}`}>
                    {styles.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1.5 ${styles.subtext}`}>
                      <Calendar size={12} /> 
                      {formatDate(walk.startTime)}
                    </div>
                    
                    <h3 className={`text-lg font-bold truncate transition-colors ${styles.heading}`}>
                      {walk.status === "SAFE" ? "Secure Walk" : walk.status === "DANGER" ? "Emergency Log" : "Ongoing Session"}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className={`flex items-center gap-1.5 font-medium ${styles.subtext}`}>
                          <Clock size={14} /> 
                          {formatTime(walk.startTime)}
                      </span>
                      {walk.durationMinutes && (
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles.metaBg}`}>
                          {walk.durationMinutes}m
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${styles.chevron} group-hover:bg-white/5`}>
                      <ChevronRight size={22} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}