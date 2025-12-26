"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Lock, Loader2, CheckCircle } from "lucide-react";

// 1. Move all your logic into this "Content" component
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // This is what was causing the build crash
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        token,
        password,
      });
      toast.success("Password reset successful!");
    } catch (err) {
      toast.error("Link expired or invalid");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleReset} className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Password</h1>
        {/* Your existing Form Input Fields here... */}
        <button 
           type="submit" 
           disabled={isLoading}
           className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold"
        >
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}

// 2. This is the main Page exported to Next.js
export default function ResetPasswordPage() {
  return (
    // The Suspense boundary catches the searchParams hook during build time
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-rose-600" size={40} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}