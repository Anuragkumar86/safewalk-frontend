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
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    return () => {
      socketRef.current?.disconnect();
      stopEverything();
    };
  }, []);

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
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const currentContacts = res.data.allContacts || [];

      if (currentContacts.length === 0) {
        setIsStarting(false);
        // BLOCK USER: Show the popup message you requested
        toast((t) => (
          <span className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <UserPlus className="text-rose-600" size={18} />
               <b className="text-rose-600">Safety Check Required</b>
            </div>
            <p className="text-xs text-slate-600">
              You haven't added any emergency contacts yet. You must add at least one to start your walk protection.
            </p>
            <button 
              onClick={() => { toast.dismiss(t.id); router.push("/dashboard/contacts"); }}
              className="bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95"
            >
              Add Contact Now
            </button>
          </span>
        ), { duration: 6000, id: "no-contacts-warning" });
        return;
      }
      
      // If contacts exist, proceed to GPS initialization
      startWalk();
    } catch (err) {
      setIsStarting(false);
      toast.error("Error verifying contacts. Please try again.");
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
        lat = pos.coords.latitude; lng = pos.coords.longitude; acc = pos.coords.accuracy;
      } else {
        const pos: any = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
        });
        lat = pos.coords.latitude; lng = pos.coords.longitude; acc = pos.coords.accuracy;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/walk/start-walk`,
        { durationMinutes: duration, startLat: lat, startLon: lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
        sessionId: sId, lat: pos.coords.latitude, lng: pos.coords.longitude
      });
    };

    if (Capacitor.isNativePlatform()) {
      watchIdRef.current = await Geolocation.watchPosition(options, onUpdate);
    } else {
      watchIdRef.current = navigator.geolocation.watchPosition(onUpdate, (e) => console.error(e), options);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWalking && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isWalking && timeLeft === 0) {
      setIsAlertSent(true);
      toast.error("Time expired! Your contacts have been notified.", { duration: 10000 });
    }
    return () => clearInterval(timer);
  }, [isWalking, timeLeft]);

  const markSafe = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/walk/mark-safe`, 
        { sessionId }, { headers: { Authorization: `Bearer ${token}` } }
      );
      stopEverything();
      toast.success("Safe at destination!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const stopEverything = () => {
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
  };

  const presets = [1, 5, 10, 15, 30, 60, 120, 180, 240, 300];
  const clampDuration = (val: number) => Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, val));

  return (
    <div style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }} className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center p-4 pb-12">
      {!isWalking ? (
        <div className="w-full max-w-md mt-1 sm:mt-6 bg-white p-6 sm:p-8 rounded-[28px] shadow-xl border border-slate-100 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-rose-50 to-rose-100 rounded-3xl flex items-center justify-center mb-5">
            <ShieldCheck className="text-rose-600" size={34} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">SafeWalk</h2>
          <p className="text-slate-500 text-sm mb-6 px-3">Guardians will be alerted if you don't check in.</p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3 px-1 text-[11px] font-bold uppercase text-slate-400">
              <span>Duration</span>
              <span>min {MIN_MINUTES} • max 5h</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {presets.map((p) => (
                <button key={p} onClick={() => setDuration(p)} className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-bold transition ${p === duration ? "bg-rose-600 text-white shadow-md" : "bg-white text-slate-700 border border-slate-100"}`}>
                  {p >= 60 ? `${p / 60}h` : `${p}m`}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <button onClick={() => setDuration((d) => clampDuration(d - 1))} className="p-3 rounded-lg bg-white border border-slate-100"><Minus size={16} /></button>
              <div className="text-center w-24">
                <div className="text-3xl font-extrabold text-slate-900 leading-none">{duration >= 60 ? `${Math.floor(duration/60)}h ${duration%60}m` : `${duration}m`}</div>
                <div className="text-xs text-slate-400">Total time</div>
              </div>
              <button onClick={() => setDuration((d) => clampDuration(d + 1))} className="p-3 rounded-lg bg-white border border-slate-100"><Plus size={16} /></button>
            </div>
          </div>

          <button
            onClick={checkContactsAndStart}
            disabled={isStarting}
            className={`w-full py-4 rounded-xl font-extrabold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${!token ? "bg-slate-900 text-white" : "bg-rose-600 text-white shadow-rose-200/60 shadow-md"}`}
          >
            {isStarting ? <Loader2 className="animate-spin" /> : !token ? <Lock size={18} /> : <Play fill="currentColor" size={18} />}
            {isStarting ? "Validating..." : !token ? "Sign in to Start" : "Start Protection"}
          </button>
        </div>
      ) : (
        <div className={`w-full max-w-md mt-1 p-6 rounded-[28px] shadow-2xl flex flex-col items-center overflow-hidden transition-colors duration-500 ${isAlertSent ? "bg-rose-600 text-white" : "bg-slate-900 text-white"}`}>
          <div className="flex w-full justify-between items-center mb-6">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-tight border ${isAlertSent ? "bg-white/20 border-white/30 text-white" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isAlertSent ? "bg-white" : "bg-rose-500"}`} />
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
              <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-2">Remaining Time</p>
              <div className="text-7xl font-extrabold mb-8 tabular-nums tracking-tight">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </>
          )}

          <button
            onClick={markSafe}
            className={`w-full py-4 rounded-xl font-extrabold text-xl transition-all shadow-md active:scale-95 mb-2 ${isAlertSent ? "bg-white text-rose-600" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}
          >
            I AM SAFE NOW
          </button>
          <p className={`text-xs opacity-70 mt-2 ${isAlertSent ? "text-white" : "text-slate-400"}`}>
            {isAlertSent ? "Mark safe to cancel further alerts" : "Click only when you reach your destination."}
          </p>
        </div>
      )}
    </div>
  );
}