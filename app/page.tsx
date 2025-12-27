
import React from "react";
import Link from "next/link";
import { Shield, MapPin, Bell, ChevronRight, Lock } from "lucide-react";

export default function LandingPage() {

 

  // toast.error("This is Error message");
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-rose-50 via-slate-50 to-white text-slate-900"
      // Make sure your global CSS / layout sets --nav-height to your navbar height if it's fixed.
      // e.g. :root { --nav-height: 72px; } or set it on the layout wrapper.
      style={{ paddingTop: "var(--nav-height, 64px)" }}
    >
      {/* HERO */}
      <header className="relative overflow-hidden pb-12">
        <div className="container mx-auto px-6">
          {/* <nav className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
                <Image src="/logo3.png" alt="SafeWalk Logo" width={40} height={40} />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight">SafeWalk</span>
            </div>
            
          </nav> */}

          <main className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* left - text */}
            <div className="md:col-span-7">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Walk with{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-rose-400">
                  confidence
                </span>
                .
              </h1>

              <p className="text-slate-600 mb-6 text-sm sm:text-base max-w-xl leading-relaxed">
                Real-time safety monitoring, instant alerts, and trusted contacts — all in a simple, mobile-first experience.
                SafeWalk keeps loved ones informed so you never have to walk alone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-3 rounded-2xl font-bold text-sm sm:text-base hover:bg-rose-700 transition shadow-lg active:scale-95"
                  aria-label="Begin your journey"
                >
                  Begin Your Journey
                  <ChevronRight size={18} />
                </Link>

                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-900 px-5 py-3 rounded-2xl font-semibold text-sm sm:text-base hover:shadow-sm transition"
                  aria-label="Learn more about features"
                >
                  Learn More
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
                <Shield className="text-rose-600" size={18} />
                <span>Private location sharing · Trusted contacts · One-tap emergency</span>
              </div>
            </div>

            {/* right - hero card (mobile-first: stacked below, on md appears right) */}
            <div className="md:col-span-5">
              <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-lg border border-transparent hover:border-rose-100 transition">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-rose-600 font-semibold uppercase mb-1">On Your Phone</div>
                    <h3 className="text-lg font-bold text-slate-900">Live tracking & instant alerts</h3>
                    <p className="text-sm text-slate-600 mt-2">Share live location, start a timer, or trigger an emergency ping instantly.</p>
                  </div>

                  <div className="hidden sm:block w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-300 flex items-center justify-center text-white shadow-md">
                    <MapPin size={28} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2 text-center text-xs">
                    <div className="font-semibold text-slate-900">Live</div>
                    <div className="text-slate-500">Track</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center text-xs">
                    <div className="font-semibold text-slate-900">Alert</div>
                    <div className="text-slate-500">1 Tap</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center text-xs">
                    <div className="font-semibold text-slate-900">Private</div>
                    <div className="text-slate-500">Encrypted</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    href="/coming-soon"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-50 text-rose-700 px-3 py-2 rounded-xl font-semibold text-sm hover:bg-rose-100 transition"
                  >
                    Get the app
                  </Link>
                  <Link
                    href="#features"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm hover:bg-slate-50 transition"
                  >
                    How it works
                  </Link>
                </div>
              </div>

              {/* subtle decoration behind the card for visual depth */}
              <div className="mt-4 hidden md:block relative">
                <div className="absolute -left-8 -top-6 w-40 h-40 bg-rose-100 rounded-full filter blur-3xl opacity-60" />
                <div className="absolute -right-6 -bottom-8 w-28 h-28 bg-rose-200 rounded-full filter blur-2xl opacity-40" />
              </div>
            </div>
          </main>
        </div>
      </header>

      {/* FEATURES */}
      <section id="features" className="py-12 sm:py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">How SafeWalk Protects You</h2>
            <p className="text-slate-500">Advanced safety tools built into a simple, mobile-first interface.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MapPin />}
              title="Live Tracking"
              description="Share your live location with trusted contacts until you arrive home safely."
              color="from-rose-600 to-rose-400"
            />
            <FeatureCard
              icon={<Bell />}
              title="Instant Alerts"
              description="One tap sends your location and an emergency signal to your entire circle."
              color="from-amber-500 to-amber-400"
            />
            <FeatureCard
              icon={<Lock />}
              title="Data Privacy"
              description="Your location data is private and only visible to the people you choose."
              color="from-sky-500 to-sky-400"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-6">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-rose-700 p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 text-center">
              <h3 className="text-xl sm:text-3xl font-extrabold mb-3">Ready to prioritize your safety?</h3>
              <p className="text-slate-200 max-w-2xl mx-auto mb-6">Join thousands of users who trust SafeWalk for their daily commutes and nighttime travels.</p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-3 rounded-2xl font-bold hover:bg-rose-50 transition"
                >
                  Create Free Account
                </Link>
                {/* <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-3 rounded-2xl text-white hover:bg-white/20 transition"
                >
                  Contact Sales
                </Link> */}
              </div>
            </div>

            <div className="absolute -right-16 -bottom-10 w-80 h-80 rounded-full bg-rose-500 opacity-20 filter blur-3xl" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 font-medium">© 2025 SafeWalk Technologies. Your safety, our mission.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color = "from-rose-600 to-rose-400",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
}) {
  // color is a gradient tailwind fragment like "from-rose-600 to-rose-400"
  return (
    <article className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${color}`}>
          {/* clone icon with white color */}
          <div className="text-white">{React.cloneElement(icon as any, { size: 20, className: "text-white" })}</div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
      </div>
    </article>
  );
}