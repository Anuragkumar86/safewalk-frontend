"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, MapPin, Bell, ChevronRight, Lock, ArrowRight } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { usePathname } from "next/navigation";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backHandler = App.addListener('backButton', () => {
      App.exitApp();
    });

    return () => {
      backHandler.then(h => h.remove());
    };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [pathname]);

  const isLoggedIn = !!user;

  return (
    /* Updated to deep Zinc-950 for a modern dark feel. 
       Used a subtle radial gradient to prevent the background from feeling "flat".
    */
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-rose-500/30 overflow-x-hidden"
      style={{ paddingTop: "var(--nav-height, 64px)" }}
    >
      {/* BACKGROUND DECORATION - Purely visual subtle glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      {/* HERO SECTION */}
      <header className="relative pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="container mx-auto px-6 relative z-10">
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Badge for mobile-first appeal */}
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-6 animate-fade-in">
                <Shield size={14} />
                <span>Trusted by over 10k users</span>
              </div> */}

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                Walk with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-orange-400">
                  confidence
                </span>
                .
              </h1>

              <p className="text-zinc-400 mb-10 text-base sm:text-lg max-w-xl leading-relaxed">
                Real-time safety monitoring, instant alerts, and trusted contacts. 
                Keep your loved ones informed and never walk alone again.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-rose-500 transition-all duration-300 shadow-xl shadow-rose-900/20 active:scale-[0.98]"
                >
                  Start your Walk
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-8 py-4 rounded-2xl font-semibold text-base hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98]"
                >
                  Learn More
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-zinc-500 border-t border-zinc-800/50 pt-8 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Private location sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Trusted circles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>One-tap SOS</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Feature Card */}
            <div className="lg:col-span-5 relative">
              {/* Glassmorphic card design */}
              <div className="relative z-20 bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-zinc-800 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                   <MapPin size={120} className="text-rose-500 -mr-10 -mt-10" />
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
                    <Bell size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Live tracking & instant alerts</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    Share live location, start a timer, or trigger an emergency ping instantly with a single gesture.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {['Live', 'Alert', 'Private'].map((label, i) => (
                      <div key={label} className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-3 text-center">
                        <div className="text-rose-400 font-bold text-sm mb-0.5">{label}</div>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                          {i === 0 ? 'Track' : i === 1 ? '1 Tap' : 'Encrypted'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link
                      href="/coming-soon"
                      className="w-full flex items-center justify-between bg-white text-zinc-950 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-colors"
                    >
                      Download Mobile App
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Decorative rings */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-rose-500/5 rounded-full pointer-events-none" />
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-zinc-800/20 rounded-full pointer-events-none" />
            </div>
          </main>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 relative bg-zinc-900/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Advanced Safety Engineering</h2>
            <p className="text-zinc-400 text-lg">Sophisticated protection simplified for your daily peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={<MapPin />}
              title="Real-time Telemetry"
              description="High-precision location sharing with active path monitoring and ETA updates."
              color="rose"
            />
            <FeatureCard
              icon={<Bell />}
              title="Smart SOS Response"
              description="Distress signals distributed across your network with automated local emergency routing."
              color="orange"
            />
            <FeatureCard
              icon={<Lock />}
              title="Military-Grade Privacy"
              description="Zero-knowledge encryption ensures only your chosen circle can ever see your path."
              color="blue"
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="relative rounded-[3rem] bg-gradient-to-br from-zinc-900 via-zinc-900 to-rose-950/40 p-8 md:p-16 border border-zinc-800 overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <h3 className="text-3xl sm:text-5xl font-bold mb-6 text-white tracking-tight">
                Prioritize your safety today.
              </h3>
              <p className="text-zinc-400 max-w-xl text-lg mb-10 leading-relaxed">
                Join the network of users who have transformed their commute into a secure, monitored experience.
              </p>
              
              <div className="flex justify-center w-full">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-3 bg-white text-zinc-950 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-transform active:scale-95 shadow-xl"
                  >
                    Start your Walk
                    <ChevronRight size={20} />
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-3 bg-rose-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-rose-500 transition-transform active:scale-95 shadow-xl shadow-rose-900/20"
                  >
                    Create Free Account
                    <ChevronRight size={20} />
                  </Link>
                )}
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-rose-600/10 filter blur-[100px]" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-900 bg-zinc-950">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center">
              <Shield size={18} />
            </div>
            SafeWalk
          </div>
          <p className="text-sm text-zinc-500 font-medium">
            © 2025 SafeWalk Technologies. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href="#" className="hover:text-rose-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-rose-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'rose' | 'orange' | 'blue';
}) {
  const colorMap = {
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  };

  return (
    <article className="group p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:translate-y-[-4px]">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-8 transition-transform group-hover:scale-110 duration-500 ${colorMap[color]}`}>
        {React.cloneElement(icon as any, { size: 28 })}
      </div>

      <h4 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h4>
      <p className="text-zinc-400 text-sm leading-relaxed leading-relaxed">{description}</p>
    </article>
  );
}