"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Play, ShieldCheck, Clock, Loader2, SignalHigh, Lock } from "lucide-react"; // Added Lock icon
import toast from "react-hot-toast";

export default function Dashboard() {
    const { data: session } = useSession();
    const router = useRouter(); // Initialize router
    const [isWalking, setIsWalking] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [duration, setDuration] = useState(15);
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };

    useEffect(() => {
        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
        return () => {
            socketRef.current?.disconnect();
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    // --- CHANGE 1: THE LOGIC GATE ---
    const startWalk = async () => {
        // Check if session exists
        if (!session) {
            toast.error("Authentication required! Redirecting to login...");
            setTimeout(() => router.push("/login"), 1500);
            return;
        }

        if (isStarting) return;
        setIsStarting(true);
        const loadToast = toast.loading("Acquiring precise GPS lock...");

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
                        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
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
                    toast.error(err.response?.data?.message || "Server error", { id: loadToast });
                }
            },
            (err) => {
                setIsStarting(false);
                toast.error("GPS Timeout. Please ensure location is ON.", { id: loadToast });
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
                    if (accuracy < 150) {
                        socketRef.current?.emit("update-location", {
                            sessionId: sId,
                            lat: latitude,
                            lng: longitude,
                        });
                    }
                },
                (err) => console.error("Watch error:", err),
                geoOptions
            );
        }
    };

    const markSafe = async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/walk/mark-safe`,
                { sessionId },
                { headers: { Authorization: `Bearer ${session?.accessToken}` } }
            );
            stopEverything();
            toast.success("Glad you're safe!");
        } catch (err) {
            toast.error("Status update failed");
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
        }
    }, [isWalking, timeLeft]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 bg-white pt-20">
            {!isWalking ? (
                <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="text-rose-600" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Safe Walk</h2>
                    <p className="text-slate-400 text-sm mb-8">Set your timer and start your journey.</p>

                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                            <span>Short Walk</span>
                            <span>Long Walk</span>
                        </div>
                        <input
                            type="range" min="1" max="60" value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                        <div className="text-5xl font-black text-slate-900 flex items-center justify-center gap-3">
                            <Clock className="text-rose-600" size={32} /> {duration}m
                        </div>
                    </div>

                    {/* --- CHANGE 2: THE UI FEEDBACK --- */}
                    <button
                        onClick={startWalk}
                        disabled={isStarting}
                        className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:bg-slate-300 ${
                            !session 
                            ? "bg-slate-800 text-white hover:bg-slate-900" 
                            : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200"
                        }`}
                    >
                        {isStarting ? (
                            <Loader2 className="animate-spin" />
                        ) : !session ? (
                            <Lock size={20} />
                        ) : (
                            <Play fill="white" size={20} />
                        )}
                        
                        {isStarting 
                            ? "Acquiring GPS..." 
                            : !session 
                                ? "Login to Start" 
                                : "Start Protection"
                        }
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-md bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl text-center border-b-[12px] border-rose-600">
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                            <SignalHigh size={16} /> Live GPS
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                            ACC: {currentAccuracy ? `${Math.round(currentAccuracy)}m` : 'LOCATING...'}
                        </div>
                    </div>

                    <h3 className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">Time Remaining</h3>
                    <div className="text-8xl font-black mb-12 font-mono tracking-tighter text-white">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>

                    <button
                        onClick={markSafe}
                        className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black text-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/20 active:translate-y-1"
                    >
                        I AM SAFE
                    </button>
                    <p className="mt-8 text-xs text-slate-500 leading-relaxed px-4">
                        Your contacts will be notified automatically if this timer reaches zero.
                    </p>
                </div>
            )}
        </div>
    );
}