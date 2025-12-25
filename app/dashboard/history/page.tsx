"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Correct import for App Router
import { Calendar, Clock, ShieldCheck, AlertTriangle, ChevronRight, Lock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

type Walk = {
  id: string | number;
  startTime?: string | number;
  endTime?: string | number | null;
  status?: "SAFE" | "DANGER" | "IN_PROGRESS" | string;
  durationMinutes?: number | null;
  notes?: string | null;
  startLat?: number | null;
  startLon?: number | null;
  accuracy?: number | null;
};

export default function HistoryPage() {
  const { data: session, status } = useSession(); // Destructure status
  const router = useRouter(); // Initialize router
  const [history, setHistory] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // Only fetch if session is authenticated
      if (status !== "authenticated" || !session?.accessToken) {
        if (status === "unauthenticated") setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<Walk[]>(`${process.env.NEXT_PUBLIC_API_URL}/walk/history`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
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
  }, [session, status]);

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
        return (
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            <ShieldCheck size={14} /> Safe
          </span>
        );
      case "DANGER":
        return (
          <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            <AlertTriangle size={14} /> Alert
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            <Clock size={14} /> In progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            <Clock size={14} /> {status ?? "Unknown"}
          </span>
        );
    }
  };

  // --- NEW: Loading State ---
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-15 px-4 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
           <div className="h-12 w-12 rounded-full border-4 border-rose-600 border-t-transparent animate-spin mb-4"></div>
           <p className="text-slate-500 font-medium">Loading your logs...</p>
        </div>
      </div>
    );
  }

  // --- NEW: Access Denied State ---
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8">
          <Lock className="text-rose-500" size={44} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">History Locked</h2>
        <p className="text-slate-500 max-w-sm mb-10 leading-relaxed">
          To protect your privacy, walk history is only visible to verified users. Please sign in to view your logs.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-3 bg-rose-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
        >
          Login to Continue <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  // --- Authorized Content ---
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto relative">
        <header className="relative mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 bg-clip-text text-transparent">
              Your Journey Logs
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            All your recorded walks and events. Tap a log to view details.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 text-rose-800 text-sm shadow-sm">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="mt-8 text-center bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-rose-50 text-rose-600 mb-4">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No walks recorded yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Start a safe walk to create your first log.
            </p>
          </div>
        ) : (
          <main className="space-y-5">
            {history.map((walk) => {
              const date = formatDate(walk.startTime);
              const time = formatTime(walk.startTime);
              const title =
                walk.status === "SAFE"
                  ? "Walk completed safely"
                  : walk.status === "DANGER"
                  ? "Emergency alert triggered"
                  : walk.status === "IN_PROGRESS"
                  ? "Walk in progress"
                  : "Walk";

              const cardBg = "bg-white"; // Simplified for clean look

              return (
                <article
                  key={walk.id}
                  className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:border-rose-200 transition-all ${cardBg}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      {walk.status === "SAFE" ? (
                        <ShieldCheck size={24} className="text-emerald-500" />
                      ) : walk.status === "DANGER" ? (
                        <AlertTriangle size={24} className="text-rose-500" />
                      ) : (
                        <Clock size={24} className="text-amber-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> {date}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-800">
                        {title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={12}/> {time}</span>
                        {walk.durationMinutes && <span>• {walk.durationMinutes} min</span>}
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-rose-500 transition-colors" />
                  </div>
                </article>
              );
            })}
          </main>
        )}
      </div>
    </div>
  );
}