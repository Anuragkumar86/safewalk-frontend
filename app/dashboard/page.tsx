"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Play, ShieldCheck, Clock, Loader2, Lock, MapPin, Minus, Plus, AlertTriangle, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
// Import your custom hook
import { useContacts } from "@/hooks/useContact";
import Image from "next/image";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";


export default function Dashboard() {
  const router = useRouter();
  const { contacts, refreshContacts } = useContacts(); // Get contacts from your hook

  const [isWalking, setIsWalking] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [duration, setDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [isAlertSent, setIsAlertSent] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<string | number | null>(null);

  const MIN_MINUTES = 1;
  const MAX_MINUTES = 300;

  useEffect(() => {

    if (Capacitor.isNativePlatform()) {
      LocalNotifications.createChannel({
        id: 'safety-alerts',
        name: 'Safety Reminders',
        importance: 5,
        description: 'Critical warnings before emergency alerts are sent',
        sound: 'beep.wav',
        visibility: 1,
        vibration: true,
      });
    }

    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // --- ADD RECOVERY LOGIC HERE ---
    const isCurrentlyWalking = localStorage.getItem("safewalk_active") === "true";
    const savedEndTime = localStorage.getItem("safewalk_end_time");
    const savedSId = localStorage.getItem("safewalk_session_id");

    if (isCurrentlyWalking && savedEndTime && savedSId) {
      const currentTime = Date.now();
      const remainingSeconds = Math.floor((parseInt(savedEndTime) - currentTime) / 1000);

      if (remainingSeconds > 0) {
        // The walk is still active! Restore it.
        setSessionId(savedSId);
        setIsWalking(true);
        setTimeLeft(remainingSeconds);
        startTracking(savedSId); // Restart GPS tracking
      } else {
        // Time expired while app was away
        setIsWalking(true);
        setTimeLeft(0);
        setIsAlertSent(true);
      }
    }
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backHandler = App.addListener("backButton", () => {
      if (isWalking) {
        toast.error("Safety tracking active. Click 'I Am Safe' to exit.");
      } else {
        // From Dashboard, always go back to Landing Page
        router.replace("/");
      }
    });

    return () => {
      backHandler.then((h) => h.remove());
    };
  }, [isWalking, router]);

  // --- LOGIC 1: CHECK EMERGENCY CONTACTS ---
  const checkContactsAndStart = async () => {
    if (!token) {
      toast.error("Please login to start protection");
      return router.push("/login");
    }

    setIsStarting(true);

    try {
      // We manually refresh to ensure we have the absolute latest list
      // This handles cases where a user might have deleted contacts in another tab
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentContacts = res.data.allContacts || [];

      if (currentContacts.length === 0) {
        setIsStarting(false);
        // BLOCK USER: Show the popup message you requested
        toast(
          (t) => (
            <span className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <UserPlus className="text-emerald-400" size={18} />
                <b className="text-emerald-400">Safety Check Required</b>
              </div>
              <p className="text-xs text-slate-300">
                You haven't added any emergency contacts yet. You must add at least one to start your walk protection.
              </p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push("/dashboard/contacts");
                }}
                className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95"
              >
                Add Contact Now
              </button>
            </span>
          ),
          { duration: 6000, id: "no-contacts-warning" }
        );
        return;
      }

      // If contacts exist, proceed to GPS initialization
      startWalk();
    } catch (err) {
      setIsStarting(false);
      toast.error("Error verifying contacts. Please try again.");
    }
  };



  const scheduleReminders = async (durationMinutes: number) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 1. Clear any stuck notifications
      await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }] });

      // 2. Calculate the exact "Dead-line" timestamp
      const now = Date.now();
      const totalMs = durationMinutes * 60 * 1000;
      const endTime = now + totalMs;

      const reminders = [];

      // Reminder: 5 Minutes Before (Only if walk > 5 mins)
      if (durationMinutes > 5) {
        reminders.push({
          title: "SafeWalk: 5 Mins Left",
          body: "You have 5 minutes to reach your destination.",
          id: 1,
          channelId: 'safety-alerts',
          schedule: {
            at: new Date(endTime - (5 * 60 * 1000)), // Exact time math
            allowWhileIdle: true // THIS IS THE KEY: it bypasses battery saving
          },
        });
      }

      // Reminder: 1 Minute Before (The "Final Warning")
      if (durationMinutes >= 2) {
        reminders.push({
          title: "⚠️ FINAL WARNING",
          body: "1 minute left! Mark safe now or contacts will be alerted.",
          id: 2,
          channelId: 'safety-alerts',
          schedule: {
            at: new Date(endTime - (1 * 60 * 1000)), // Exact time math
            allowWhileIdle: true
          },
        });
      }

      await LocalNotifications.schedule({ notifications: reminders });
    } catch (err) {
      console.error("Schedule error:", err);
    }
  };




  const startWalk = async () => {

    setIsAlertSent(false);
    const loadToast = toast.loading("Initializing GPS Hardware...");

    try {
      let lat, lng, acc;

      if (Capacitor.isNativePlatform()) {
        const perms = await Geolocation.requestPermissions();
        if (perms.location !== "granted") throw new Error("Location permission denied");
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        acc = pos.coords.accuracy;
      } else {
        const pos: any = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        acc = pos.coords.accuracy;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/walk/start-walk`,
        { durationMinutes: duration, startLat: lat, startLon: lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') {
          toast.error("Please enable notifications so we can remind you to mark yourself safe!");
        }
      }


      
      const endTime = Date.now() + duration * 60 * 1000;
      localStorage.setItem("safewalk_session_id", res.data.sessionId);
      localStorage.setItem("safewalk_end_time", endTime.toString());
      localStorage.setItem("safewalk_active", "true");
      
      await scheduleReminders(duration);
      
      setSessionId(res.data.sessionId);
      setCurrentAccuracy(acc);
      setIsWalking(true);
      setTimeLeft(duration * 60);
      startTracking(res.data.sessionId);
      toast.dismiss(loadToast);
      toast.success("SafeWalk protection is active!");
    } catch (err: any) {
      toast.dismiss(loadToast);
      toast.error(err.message || "GPS Error: Please enable location");
    } finally {
      setIsStarting(false);
    }
  };

  const startTracking = async (sId: string) => {
    const options = { enableHighAccuracy: true, timeout: 5000 };
    const onUpdate = (pos: any) => {
      if (!pos) return;
      setCurrentAccuracy(pos.coords.accuracy);
      socketRef.current?.emit("update-location", {
        sessionId: sId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    };

    if (Capacitor.isNativePlatform()) {
      watchIdRef.current = await Geolocation.watchPosition(options, onUpdate);
    } else {
      watchIdRef.current = navigator.geolocation.watchPosition(onUpdate, (e) => console.error(e), options);
    }
  };

  // --- REPLACE YOUR SECOND USEEFFECT WITH THIS ---
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isWalking && !isAlertSent) {
      timer = setInterval(() => {
        const savedEndTime = localStorage.getItem("safewalk_end_time");
        if (savedEndTime) {
          const currentTime = Date.now();
          const targetTime = parseInt(savedEndTime);
          const remaining = Math.floor((targetTime - currentTime) / 1000);

          if (remaining <= -10) { // <--- CHANGE THIS TO -10
            // We wait 10 seconds AFTER the timer hits zero 
            // before showing the Red Screen/Sending Alert.
            setTimeLeft(0);
            setIsAlertSent(true);
            clearInterval(timer);
          } else {
            // Keep the UI showing 0 if we are in the 10-second grace period
            setTimeLeft(remaining < 0 ? 0 : remaining);
          }
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isWalking, isAlertSent]);

  // --- REPLACE YOUR MARKSAFE FUNCTION WITH THIS ---
  const markSafe = async () => {
    // Grab values from state OR localStorage as a fallback
    const activeSessionId = sessionId || localStorage.getItem("safewalk_session_id");
    const activeToken = token || localStorage.getItem("token");

    if (!activeSessionId || !activeToken) {
      toast.error("Session data missing. Resetting...");
      stopEverything();
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/walk/mark-safe`,
        { sessionId: activeSessionId },
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );

      stopEverything(); // This clears the Red Screen and Storage
      toast.success("Glad you are safe!");
    } catch (err) {
      console.error("Mark Safe Error:", err);
      toast.error("Failed to update status. Check internet.");
    }
  };

  const stopEverything = () => {

    // --- ADD THIS LINE ---
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }] });
    }
    // ----------------------
    localStorage.removeItem("safewalk_active");
    localStorage.removeItem("safewalk_end_time");
    localStorage.removeItem("safewalk_session_id");

    if (watchIdRef.current !== null) {
      if (Capacitor.isNativePlatform()) {
        Geolocation.clearWatch({ id: watchIdRef.current as string });
      } else {
        navigator.geolocation.clearWatch(watchIdRef.current as number);
      }
    }

    setIsWalking(false);
    setSessionId(null);
    setCurrentAccuracy(null);
    setIsAlertSent(false);

    // Force the UI back to the start state
    router.refresh();
  };

  const presets = [1, 5, 10, 15, 30, 60, 120, 180, 240, 300];
  const clampDuration = (val: number) => Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, val));

  return (
    // Use safe-area calc via Tailwind arbitrary value; mobile-first dark layout
    <div className="min-h-screen pt-[calc(env(safe-area-inset-top,12px)+68px)] bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-900 flex flex-col items-center p-4 pb-12">
      {!isWalking ? (
        <div className="w-full max-w-md mt-1 sm:mt-6 bg-slate-800/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(2,6,23,0.7)] border border-slate-700 text-center">
          <div
            className="mx-auto relative w-20 h-20 bg-gradient-to-br from-emerald-700 to-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
            aria-hidden
          >
            <Image
              src="/logo3.png"
              alt="SafeWalk Logo"
              fill
              className="object-contain group-hover:scale-105 transition-transform rounded-xl"
            />
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-1">SafeWalk</h2>
          <p className="text-slate-300 text-sm mb-6 px-3">
            Guardians will be alerted if you don't click the safe button before the timer ends.
          </p>

          <div className="bg-slate-800/60 rounded-2xl p-4 mb-6 border border-slate-700">
            <div className="flex items-center justify-between mb-3 px-1 text-[11px] font-bold uppercase text-slate-400">
              <span>Duration</span>
              <span>min {MIN_MINUTES} • max 5h</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setDuration(p)}
                  className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-bold transition ${p === duration
                    ? "bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.12)]"
                    : "bg-slate-800 text-slate-200 border border-slate-700"
                    }`}
                >
                  {p >= 60 ? `${p / 60}h` : `${p}m`}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setDuration((d) => clampDuration(d - 1))}
                className="p-3 rounded-lg bg-slate-700 border border-slate-700 text-slate-200"
                aria-label="Decrease duration"
              >
                <Minus size={16} />
              </button>
              <div className="text-center w-28">
                <div className="text-3xl font-extrabold text-white leading-none">
                  {duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`}
                </div>
                <div className="text-xs text-slate-400">Total time</div>
              </div>
              <button
                onClick={() => setDuration((d) => clampDuration(d + 1))}
                className="p-3 rounded-lg bg-slate-700 border border-slate-700 text-slate-200"
                aria-label="Increase duration"
              >
                <Plus size={16} />
              </button>
            </div>

            <p className="py-3 text-slate-400 text-sm">
              Please select the estimated time by which you expect to reach your destination safely.
            </p>
          </div>

          <button
            onClick={checkContactsAndStart}
            disabled={isStarting}
            className={`w-full py-4 rounded-xl font-extrabold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${!token
              ? "bg-slate-700 text-slate-200 border border-slate-600"
              : "bg-emerald-500 text-slate-900 shadow-[0_12px_30px_rgba(34,197,94,0.12)]"
              }`}
          >
            {isStarting ? <Loader2 className="animate-spin" /> : !token ? <Lock size={18} /> : <Play fill="currentColor" size={18} />}
            {isStarting ? "Validating..." : !token ? "Sign in to Start" : "Start Protection"}
          </button>
        </div>
      ) : (
        <div
          className={`w-full max-w-md p-6 mt-50 rounded-3xl shadow-2xl flex flex-col items-center overflow-hidden transition-colors duration-500 ${isAlertSent ? "bg-rose-700 text-white" : "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
            }`}
        >
          <div className="flex w-full justify-between items-center mb-6">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-tight border ${isAlertSent
                ? "bg-white/10 border-white/20 text-white"
                : "bg-emerald-600/10 text-emerald-300 border-emerald-600/20"
                }`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${isAlertSent ? "bg-white" : "bg-emerald-400"}`} />
              {isAlertSent ? "EMERGENCY" : "Live"}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold opacity-80">
              <MapPin size={12} />
              {currentAccuracy ? `${Math.round(currentAccuracy)}m` : "Locating..."}
            </div>
          </div>

          {isAlertSent ? (
            <div className="text-center py-4">
              <AlertTriangle size={64} className="mx-auto mb-4 text-white" />
              <h3 className="text-2xl font-black mb-2">ALERT SENT</h3>
              <p className="text-sm opacity-90 px-4 mb-8 font-medium">Your emergency contacts have been notified with your last known location.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-300 font-semibold text-xs uppercase tracking-widest mb-2">Remaining Time</p>
              <div className="text-6xl sm:text-7xl font-extrabold mb-8 tabular-nums tracking-tight">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </>
          )}

          {/* --- UPDATED BUTTON LOGIC --- */}
          <button
            onClick={isAlertSent ? stopEverything : markSafe}
            className={`w-full py-4 rounded-xl font-extrabold text-xl transition-all shadow-md active:scale-95 mb-2 ${isAlertSent ? "bg-white text-rose-600" : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
          >
            {isAlertSent ? "RETURN TO DASHBOARD" : "I AM SAFE NOW"}
          </button>

          <p className={`text-xs opacity-75 mt-2 ${isAlertSent ? "text-white" : "text-slate-300"}`}>
            {isAlertSent ? "The alert was already sent. Your journey history will reflect this." : "Click only when you reach your destination."}
          </p>

        </div>
      )}
    </div>
  );
}