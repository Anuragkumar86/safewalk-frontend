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
            top: "calc(env(safe-area-inset-top, 0px) + 75px)",
          }}
          toastOptions={{
            duration: 4000,
            style: {
              zIndex: 9999,
            },
          }}
        />
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  );
}
