import Link from "next/link";
import Image from "next/image";
import { Construction, ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Safe spacing for existing navbar */}
      <main className="flex-1 pt-[72px] md:pt-[88px] flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="relative bg-white rounded-[2.5rem] shadow-xl p-10 text-center overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo3.png"
                  alt="SafeWalk"
                  width={56}
                  height={56}
                />
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Construction size={32} />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                Coming Soon 🚧
              </h1>

              <p className="text-slate-600 leading-relaxed mb-8">
                This feature is currently under development and will be
                available very soon. We’re working hard to bring it to you.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-rose-700 active:scale-95 transition"
                >
                  <ArrowLeft size={18} />
                  Back to Dashboard
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center text-slate-500 text-sm hover:text-slate-700 transition"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-slate-400 mt-6">
            © 2025 SafeWalk · Building safer journeys
          </p>
        </div>
      </main>
    </div>
  );
}
