"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Direct call to your AWS Backend Login Route
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password,
      });

      // 2. Destructure the token and user from your backend response
      // Assuming your backend returns: { token: "...", user: { name: "...", email: "..." } }
      const { token, user } = response.data;

      // 3. Save to LocalStorage (This is your "Mobile Session")
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Welcome back!");
      
      // 4. Redirect to Dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    // Informing mobile users that Google Login is web-only for now
    toast.error("Google login is available on the web version.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-slate-100">
        
        {/* Left decorative panel */}
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
            <h3 className="text-xl font-bold mb-3">Welcome Back</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Sign in to continue to your dashboard and manage your safety sessions with ease.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-8 lg:p-12">
          <header className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-2 text-rose-600">Login</h1>
            <p className="text-sm text-slate-500 font-medium">
              Enter your credentials to access your dashboard
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1 w-full px-4 py-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <Link href="/forgot" className="text-xs font-bold text-rose-600 hover:underline">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full px-4 py-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            {/* <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-slate-100" />
              <div className="text-xs font-bold text-slate-300 uppercase tracking-tighter">Social Login</div>
              <div className="flex-1 h-px bg-slate-100" />
            </div> */}

            {/* <button
              onClick={handleGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-2xl px-4 py-3 hover:bg-slate-50 transition font-semibold text-slate-600"
            >
              <FcGoogle size={22} />
              <span className="text-sm">Continue with Google</span>
            </button> */}

            <p className="text-center text-sm text-slate-500 font-medium mt-4">
              Don't have an account?{" "}
              <Link href="/register" className="text-rose-600 font-bold hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}