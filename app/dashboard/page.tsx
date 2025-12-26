"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Play, ShieldCheck, Clock, Loader2, SignalHigh, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
    const router = useRouter();
    const [isWalking, setIsWalking] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [duration, setDuration] = useState(15);
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);

    // Authentication State (Replacing useSession)
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const socketRef = useRef<Socket | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };

    // 1. Initial Auth Check & Socket Setup
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
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    const startWalk = async () => {
        // Redirect to login if no token found
        if (!token) {
            toast.error("Please login to start protection");
            router.push("/login");
            return;
        }

        if (isStarting) return;
        setIsStarting(true);
        const loadToast = toast.loading("Acquiring high-accuracy GPS...");

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude, accuracy } = pos.coords;
                    setCurrentAccuracy(accuracy);

                    const res = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/walk/start-walk`,
                        {
                            durationMinutes: duration,
                            startLat: latitude,
                            startLon: longitude
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    setSessionId(res.data.sessionId);
                    setIsWalking(true);
                    setTimeLeft(duration * 60);
                    setIsStarting(false);
                    toast.dismiss(loadToast);

                    startTracking(res.data.sessionId);
                    toast.success("Safety tracking active!");
                } catch (err: any) {
                    setIsStarting(false);
                    toast.error(err.response?.data?.message || "Failed to start walk", { id: loadToast });
                }
            },
            (err) => {
                setIsStarting(false);
                toast.error("GPS Error: Please enable location permissions.", { id: loadToast });
            },
            geoOptions
        );
    };

    const startTracking = (sId: string) => {
        if ("geolocation" in navigator) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude, accuracy } = pos.coords;
                    setCurrentAccuracy(accuracy);
                    
                    // Only emit if accuracy is decent
                    if (accuracy < 150) {
                        socketRef.current?.emit("update-location", {
                            sessionId: sId,
                            lat: latitude,
                            lng: longitude,
                        });
                    }
                },
                (err) => console.error("Tracking error:", err),
                geoOptions
            );
        }
    };

    const markSafe = async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/walk/mark-safe`,
                { sessionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            stopEverything();
            toast.success("Glad you're safe!");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const stopEverything = () => {
        setIsWalking(false);
        setSessionId(null);
        setCurrentAccuracy(null);
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };

    useEffect(() => {
        if (isWalking && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && isWalking) {
            setIsWalking(false);
            // In a real app, the backend triggers the alert when timer hits zero
        }
    }, [isWalking, timeLeft]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] p-6 bg-white">
            {!isWalking ? (
                <div className="w-full max-w-md bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <ShieldCheck className="text-rose-600" size={40} />
                    </div>
                    
                    <h2 className="text-3xl font-black text-slate-900 mb-2">SafeWalk</h2>
                    <p className="text-slate-500 font-medium mb-10 text-sm leading-relaxed">
                        Set your travel time. If you don't check in, your guardians will be alerted.
                    </p>

                    <div className="bg-slate-50 rounded-[2.5rem] p-6 mb-10 border border-slate-100">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">
                            <span>Short Trip</span>
                            <span>Long Journey</span>
                        </div>
                        <input
                            type="range" min="1" max="60" value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600 mb-6"
                        />
                        <div className="text-6xl font-black text-slate-900 flex items-center justify-center gap-3">
                            <span className="text-rose-600 text-4xl">
                                <Clock size={40} strokeWidth={3} />
                            </span>
                            {duration}<span className="text-2xl text-slate-400">m</span>
                        </div>
                    </div>

                    <button
                        onClick={startWalk}
                        disabled={isStarting}
                        className={`w-full py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg ${
                            !token 
                            ? "bg-slate-800 text-white" 
                            : "bg-rose-600 text-white shadow-rose-200"
                        }`}
                    >
                        {isStarting ? (
                            <Loader2 className="animate-spin" />
                        ) : !token ? (
                            <Lock size={22} />
                        ) : (
                            <Play fill="currentColor" size={22} />
                        )}
                        
                        {isStarting 
                            ? "Connecting GPS..." 
                            : !token 
                                ? "Sign in to Start" 
                                : "Start Protection"
                        }
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-md bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl text-center relative overflow-hidden">
                    {/* Pulsing background effect */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-rose-600 animate-pulse" />
                    
                    <div className="flex justify-between items-center mb-16">
                        <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                            Live Tracking
                        </div>
                        <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase">
                           Acc: {currentAccuracy ? `${Math.round(currentAccuracy)}m` : '...'}
                        </div>
                    </div>

                    <h3 className="text-slate-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Check-in Timer</h3>
                    <div className="text-[7rem] leading-none font-black mb-16 font-mono tracking-tighter text-white">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>

                    <button
                        onClick={markSafe}
                        className="w-full bg-emerald-500 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                        I AM SAFE
                    </button>
                    
                    <div className="mt-10 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold">
                        <ShieldCheck size={14} />
                        End-to-End Encrypted Location
                    </div>
                </div>
            )}
        </div>
    );
}