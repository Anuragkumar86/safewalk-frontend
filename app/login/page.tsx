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
      className="min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-b from-[#06070a] via-[#071026] to-[#081226] text-slate-100"
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-neutral-900/40">
        {/* Left decorative panel (hidden on small screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10 relative overflow-hidden">
          {/* subtle decorative shapes */}
          <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-gradient-to-tr from-rose-700/30 to-indigo-700/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-28 -bottom-24 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-600/10 to-sky-700/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div className="w-20 h-20 bg-white/4 rounded-3xl flex items-center justify-center mb-4 border border-white/6 shadow-sm">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo3.png"
                  alt="SafeWalk Logo"
                  fill
                  className="object-contain transition-transform rounded-2xl"
                />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-slate-50">SafeWalk</h2>
            <p className="text-sm text-slate-300 max-w-xs">
              Keep your journeys safer — real-time protection and trusted guardians.
            </p>

            <div className="mt-6 bg-gradient-to-br from-white/3 to-white/2 rounded-xl px-4 py-3 border border-white/6">
              <h3 className="text-sm font-bold text-slate-100">Why SafeWalk?</h3>
              <ul className="mt-3 text-xs text-slate-300 space-y-2 text-left">
                <li>• Real-time location sharing</li>
                <li>• Emergency guardian alerts</li>
                <li>• Simple, private contact management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Login Form (mobile-first) */}
        <div className="p-6 md:p-8">
          <header className="mb-6 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-4">
              <div className="w-16 h-16 bg-neutral-800/40 rounded-2xl flex items-center justify-center border border-white/6">
                <div className="relative w-16 h-16">
                  <Image
                    src="/logo3.png"
                    alt="SafeWalk Logo"
                    fill
                    className="object-contain transition-transform rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-300 font-medium">Sign in to continue to your SafeWalk dashboard</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Email Address</label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-sm md:text-base font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition"
                  aria-label="Email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Password</label>
                <Link href="/forgot-password?mode=query" className="text-sm font-medium text-rose-400 hover:underline">
                  Forgot?
                </Link>
              </div>

              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-sm md:text-base font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition"
                  aria-label="Password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-black font-extrabold text-base md:text-lg shadow-md hover:from-rose-600 hover:to-rose-700 active:scale-95 transition transform-gpu flex items-center justify-center gap-3 disabled:opacity-60"
              aria-busy={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Sign in"}
            </button>

            <p className="text-center text-sm text-slate-300 font-medium mt-2">
              New to SafeWalk?{" "}
              <Link href="/register" className="text-rose-400 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </form>

          {/* subtle footer / help link */}
          {/* <div className="mt-6 text-center text-xs text-slate-400">
            Having trouble signing in? <Link href="/support" className="text-rose-400 hover:underline">Contact support</Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}