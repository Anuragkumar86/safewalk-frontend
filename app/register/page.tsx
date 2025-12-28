"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import Image from "next/image";

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
      className="min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-b from-[#04050a] via-[#071026] to-[#081226] text-slate-100"
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-neutral-900/40">
        {/* Left decorative panel (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10 relative overflow-hidden">
          {/* soft gradient blobs */}
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
              Join SafeWalk to keep your journeys safer — real-time protection and trusted guardians.
            </p>

            <div className="mt-6 bg-gradient-to-br from-white/3 to-white/2 rounded-xl px-4 py-3 border border-white/6">
              <h3 className="text-sm font-bold text-slate-100">Why join?</h3>
              <ul className="mt-3 text-xs text-slate-300 space-y-2 text-left">
                <li>• Real-time location sharing</li>
                <li>• Emergency guardian alerts</li>
                <li>• Simple, private contact management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Form (mobile-first) */}
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

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 mb-1">Create account</h1>
            <p className="text-sm text-slate-300 font-medium">Join SafeWalk — it only takes a minute.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Signup form">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Full name</label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-sm md:text-base font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition"
                  aria-label="Full name"
                />
              </div>
            </div>

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
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Password</label>
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
              {isLoading ? <Loader2 className="animate-spin" /> : "Create account"}
            </button>

            <p className="text-center text-sm text-slate-300 font-medium mt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-400 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </form>

          {/* subtle footer / help link */}
          {/* <div className="mt-6 text-center text-xs text-slate-400">
            By creating an account you agree to our <Link href="/terms" className="text-rose-400 hover:underline">Terms</Link> and <Link href="/privacy" className="text-rose-400 hover:underline">Privacy Policy</Link>.
          </div> */}
        </div>
      </div>
    </div>
  );
}