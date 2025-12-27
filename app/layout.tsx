import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavbarWrapper from "@/components/NavBarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeWalk",
  description: "Welcome to SafeWalk app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}>
        {/* Only ONE Toaster for the whole app */}
        <Toaster
          position="top-center"
          containerStyle={{
            top: "calc(env(safe-area-inset-top, 0px) + 75px)", // navbar safe
          }}
          toastOptions={{
            duration: 4000,
            style: {
              zIndex: 9999,
              borderRadius: "16px",
              padding: "14px 18px",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow:
                "0 10px 25px -10px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.08)",
            },

            // ✅ SUCCESS TOAST
            success: {
              style: {
                background: "#ECFDF5", // light green
                color: "#065F46", // dark green text
                border: "1px solid #A7F3D0",
              },
              iconTheme: {
                primary: "#10B981",
                secondary: "#ECFDF5",
              },
            },

            // ❌ ERROR TOAST
            error: {
              style: {
                background: "#DC2626", // strong red
                color: "#FFFFFF", // white text for contrast
                border: "1px solid #B91C1C",
              },
              iconTheme: {
                primary: "#FFFFFF",
                secondary: "#DC2626",
              },
            },

            // ⏳ LOADING TOAST
            loading: {
              style: {
                background: "#0F172A", // slate-900
                color: "#E5E7EB",
                border: "1px solid #1F2937",
              },
            },
          }}
        />
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  );
}
