"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Hide navbar on auth pages (handles /login, /login/, /register, etc.)
  const hideNavbar =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (hideNavbar) {
    return null;
  }

  return <Navbar />;
}
