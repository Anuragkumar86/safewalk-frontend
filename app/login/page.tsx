
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    }
  };

  const handleGoogle = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    // signIn will redirect to callbackUrl by default (or use callbackUrl param)
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left decorative panel */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-rose-600 text-white p-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              {/* A simple SVG brand mark */}
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2L20 8v8l-8 6-8-6V8l8-6z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">YourApp</h2>
              <p className="text-sm opacity-90">Secure, fast and delightful</p>
            </div>
          </div>

          <div className="max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-2">Welcome Back</h3>
            <p className="text-sm opacity-90">
              Sign in to continue to your dashboard and manage your projects with ease.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-8 lg:p-12">
          <h1 className="text-2xl font-bold text-center lg:text-left mb-2 text-rose-600">Welcome Back</h1>
          <p className="text-sm text-gray-500 mb-6 text-center lg:text-left">
            Enter your credentials to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
            </label>

            <label className="block">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Password</span>
                <Link href="/forgot" className="text-sm text-rose-600 hover:underline">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold shadow hover:from-rose-600 hover:to-rose-700 transition cursor-pointer"
            >
              Sign in
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="text-xs text-gray-400">or continue with</div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google button: icon is visible via inline SVG; icon styled inside a circular badge for better alignment */}
            <button
              onClick={handleGoogle}
              type="button"
              aria-label="Sign in with Google"
              className="w-full mt-1 flex items-center justify-center gap-3 border border-gray-200 rounded-lg px-4 py-2 hover:shadow-sm transition cursor-pointer hover:bg-gray-200"
            >
              <span className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm">
                <FcGoogle className="w-5 h-5" />
              </span>
              <span className="text-sm font-medium text-gray-700">Continue with Google</span>
            </button>

            <p className="text-center text-sm text-gray-500 mt-2">
              Don't have an account?{" "}
              <Link href="/register" className="text-rose-600 font-medium hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}