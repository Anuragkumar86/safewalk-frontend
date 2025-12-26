"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { User, Mail, Lock, Loader2 } from "lucide-react";


export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Dismiss any previous toasts (optional)
    toast.dismiss();
    setIsLoading(true);
    try {
      // Direct call to your backend (logic unchanged)
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData);

      // Show a success toast and wait briefly before navigating so the global Toaster can pick up the toast lifecycle.
      toast.success("Account created! Please login.", { id: "signup-success", duration: 3500 });

      // short delay so toast registers with persistent global Toaster (avoid immediate unmount issues)
      await new Promise((res) => setTimeout(res, 700));

      router.push("/login");
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      // ensure content does not hide behind top nav + device safe-area (adjust nav offset if your navbar differs)
      style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }}
      className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-4"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-slate-100">
        {/* Left decorative panel (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-rose-600 text-white p-10 gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-6 pointer-events-none">
            <svg width="100%" height="100%" className="opacity-10">
              <defs>
                <pattern id="pattern-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern-dots)" />
            </svg>
          </div>

          <div className="z-10 flex flex-col items-center text-center px-6">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-4 border border-white/20">
              {/* Decorative icon */}
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2L20 8v8l-8 6-8-6V8l8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight mb-2">SafeWalk</h2>
            <p className="text-sm opacity-90 max-w-xs">
              Join SafeWalk to keep your journeys safer — real-time protection and trusted guardians.
            </p>

            <div className="mt-6 bg-white/10 rounded-xl px-4 py-3">
              <h3 className="text-sm font-bold">Why join?</h3>
              <ul className="mt-3 text-xs text-white/90 space-y-2 text-left">
                <li>• Real-time location sharing</li>
                <li>• Emergency guardian alerts</li>
                <li>• Simple, private contact management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Form (mobile-first) */}
        <div className="p-6 md:p-10">
          <header className="mb-6 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-4">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2L20 8v8l-8 6-8-6V8l8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">Create account</h1>
            <p className="text-sm text-slate-500 font-medium">Join SafeWalk — it only takes a minute.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Full name</label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm md:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                />
              </div>
            </div>

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
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Password</label>
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
              {isLoading ? <Loader2 className="animate-spin" /> : "Create account"}
            </button>

            

            <p className="text-center text-sm text-slate-500 font-medium mt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-600 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}