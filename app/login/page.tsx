"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();
    setIsLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, formData);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Welcome back${user?.name ? `, ${user.name}` : ""}`, {
        id: "login-success",
        duration: 3500,
      });

      // small delay so toast registers with persistent global Toaster
      await new Promise((res) => setTimeout(res, 700));
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }}
      className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-4"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-slate-100">
        {/* Left decorative panel (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-rose-600 text-white p-10 gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-6 pointer-events-none">
            <svg width="100%" height="100%" className="opacity-10" aria-hidden>
              <defs>
                <pattern id="pattern-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern-dots)" />
            </svg>
          </div>

          <div className="z-10 flex flex-col items-center text-center px-6">
            <div className="w-15 h-15 bg-white/10 rounded-3xl flex items-center justify-center mb-4 border border-white/20">
            <div className="relative w-15 h-15">
              <Image
                src="/logo3.png"
                alt="SafeWalk Logo"
                fill
                className="object-contain group-hover:scale-110 transition-transform rounded-2xl"
              />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight mb-2">SafeWalk</h2>
            <p className="text-sm opacity-90 max-w-xs">
              Keep your journeys safer — real-time protection and trusted guardians.
            </p>

            <div className="mt-6 bg-white/10 rounded-xl px-4 py-3">
              <h3 className="text-sm font-bold">Why SafeWalk?</h3>
              <ul className="mt-3 text-xs text-white/90 space-y-2 text-left">
                <li>• Real-time location sharing</li>
                <li>• Emergency guardian alerts</li>
                <li>• Simple, private contact management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Login Form (mobile-first) */}
        <div className="p-6 md:p-10">
          <header className="mb-6 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-4">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2L20 8v8l-8 6-8-6V8l8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500 font-medium">Sign in to continue to your SafeWalk dashboard</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Email Address</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm md:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Password</label>
                <Link href="/forgot-password?mode=query" className="text-sm font-medium text-rose-600">
                  Forgot?
                </Link>
              </div>

              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm md:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-3 rounded-xl bg-rose-600 text-white font-extrabold text-base md:text-lg shadow-md hover:bg-rose-700 active:scale-95 transition transform-gpu flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Sign in"}
            </button>

            <p className="text-center text-sm text-slate-500 font-medium mt-2">
              New to SafeWalk?{" "}
              <Link href="/register" className="text-rose-600 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}