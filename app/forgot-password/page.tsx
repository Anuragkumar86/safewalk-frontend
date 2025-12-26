"use client";
import { useState } from "react";
import axios from "axios";
import { ArrowLeft, Mail, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
//   toast.success("Reset link sent! Check your inbox.", {
//     duration: 5000,
//     position: "bottom-center",
//   });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email });
      toast.success("Reset link sent! Check your inbox.", {
        duration: 5000,
        position: "bottom-center",
      });
      // Optional: redirect back to login after a delay
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pt-24">
      <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
        
        {/* Header Icon */}
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheck className="text-rose-600" size={40} />
        </div>

        <h2 className="text-3xl font-black text-center text-slate-900 mb-2">Forgot Password?</h2>
        <p className="text-slate-500 text-center text-sm mb-8 px-4 leading-relaxed">
          No worries! Enter your email below and we'll send you a secure link to reset it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-rose-200 transition-all">
              <Mail size={20} className="text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-rose-600 text-white font-black text-lg shadow-xl shadow-rose-100 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
          </button>
        </form>

        <button 
          onClick={() => router.push("/login")}
          className="w-full mt-6 flex items-center justify-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>
      </div>
    </div>
  );
}