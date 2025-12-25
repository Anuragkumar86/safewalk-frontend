"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Calendar, Clock, ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";
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
  const { data: session } = useSession();
  const [history, setHistory] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.accessToken) {
        setLoading(false);
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
  }, [session]);

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

  // Loading skeleton (mobile-first)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-15 px-4 ">
        <div className="max-w-3xl mx-auto ">
          <div className="relative mb-8 mt-14">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 ">
              Your Journey Logs
            </h1>
            <p className="mt-2 text-sm text-slate-500">All your recorded walks and events. Tap a log to view details.</p>
          </div>

          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center bg-white rounded-2xl p-4 shadow-md">
                <div className="h-14 w-14 rounded-xl bg-slate-200" />
                <div className="flex-1">
                  <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                </div>
                <div className="h-8 w-8 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Decorative big faint background title */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 transform -translate-x-1/2 -top-10 text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 opacity-5 select-none"
        >
          Your Journey Logs
        </div>

        {/* Header */}
        <header className="relative mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            <span className="bg-linear-to-r from-rose-600 via-rose-500 to-amber-400 bg-clip-text text-transparent">
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
          <div className="mt-8 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-rose-50 text-rose-600 mb-4 shadow">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No walks recorded yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Start a safe walk to create your first log — your history will appear here.
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

              // Determine card theming
              const cardBg =
                walk.status === "DANGER"
                  ? "bg-gradient-to-r from-rose-300 to-rose-400"
                  : walk.status === "SAFE"
                  ? "bg-gradient-to-r from-emerald-300 to-emerald-400"
                  : "bg-gradient-to-r from-sky-50/60 to-sky-50/40";

              const iconWrapper =
                walk.status === "DANGER"
                  ? "bg-rose-100 text-rose-600"
                  : walk.status === "SAFE"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700";

              return (
                <article
                  key={walk.id}
                  className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 ${cardBg} border border-white/60`}
                  aria-labelledby={`walk-${walk.id}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 h-14 w-14 rounded-lg flex items-center justify-center ${iconWrapper} shadow-sm`}
                      aria-hidden
                    >
                      {walk.status === "SAFE" ? (
                        <ShieldCheck size={20} />
                      ) : walk.status === "DANGER" ? (
                        <AlertTriangle size={20} />
                      ) : (
                        <Clock size={20} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p id={`walk-${walk.id}`} className="text-xs sm:text-sm text-gray-900 flex items-center gap-2 truncate">
                            <Calendar size={14} /> <span>{date}</span>
                          </p>

                          <h3 className="mt-1 text-base sm:text-lg font-semibold text-slate-900 truncate">
                            {title}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-800">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} /> {time}
                            </span>

                            {typeof walk.durationMinutes === "number" && (
                              <span className="inline-flex items-center gap-1">• {walk.durationMinutes} min</span>
                            )}

                            {typeof walk.accuracy === "number" && (
                              <span className="inline-flex items-center gap-1">• acc {Math.round(walk.accuracy)} m</span>
                            )}

                            {walk.startLat != null && walk.startLon != null && (
                              <span className="inline-flex items-center gap-1 truncate">• <span className="font-mono">{`${walk.startLat.toFixed(4)}, ${walk.startLon.toFixed(4)}`}</span></span>
                            )}
                          </div>
                        </div>

                        {/* Badge for larger screens */}
                        <div className="hidden sm:flex sm:items-center sm:gap-2 sm:ml-3">
                          {statusBadge(walk.status)}
                        </div>
                      </div>

                      {/* Footer row for small screens */}
                      <div className="mt-3 sm:hidden flex items-center justify-between gap-2">
                        <div>{statusBadge(walk.status)}</div>
                        <div className="text-xs text-slate-500">Tap for details</div>
                      </div>
                    </div>

                    {/* Chevron / action */}
                    <div className="flex items-center ml-2">
                      <button
                        className="p-2 rounded-full hover:bg-white/40 transition"
                        aria-label="View details"
                        onClick={() => {
                          // Placeholder handler - replace with actual navigation when available
                          console.log("Open details for", walk.id);
                        }}
                      >
                        <ChevronRight size={20} className="text-slate-500 group-hover:text-slate-700" />
                      </button>
                    </div>
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