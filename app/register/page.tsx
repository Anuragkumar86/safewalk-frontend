"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
// REMOVED: import { signIn } from "next-auth/react"; (NextAuth doesn't work with static export)
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Direct call to your AWS Backend
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData);
      
      toast.success("Account created! Please login.");
      router.push("/login");
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    // In a Capacitor/Mobile app, Google Login requires a native plugin
    // For now, we show a toast informing the user to use the web version for Google
    toast.error("Google login is currently available on the web version only.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-4 pt-15">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-slate-100">
        
        {/* Left decorative panel (Hidden on small mobile screens to save space) */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-rose-600 text-white p-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2L20 8v8l-8 6-8-6V8l8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">SafeWalk</h2>
              <p className="text-sm opacity-80 font-medium">Your Safety, Our Priority</p>
            </div>
          </div>

          <div className="max-w-xs text-center">
            <h3 className="text-xl font-bold mb-3">Join the Community</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Create an account to start using Safe-Walk Buddy — keep your journeys safer and smarter.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-8 lg:p-12">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Create account</h1>
            <p className="text-sm text-slate-500 font-medium">
              Join Safe-Walk Buddy — it only takes a minute.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="mt-1 w-full px-4 py-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@email.com"
                className="mt-1 w-full px-4 py-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1 w-full px-4 py-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>

            {/* <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-slate-100" />
              <div className="text-xs font-bold text-slate-300 uppercase tracking-tighter">Social Signup</div>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <button
              onClick={handleGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-2xl px-4 py-3 hover:bg-slate-50 transition font-semibold text-slate-600"
            >
              <FcGoogle size={22} />
              <span className="text-sm">Continue with Google</span>
            </button> */}

            <p className="text-center text-sm text-slate-500 font-medium mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-600 font-bold hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}