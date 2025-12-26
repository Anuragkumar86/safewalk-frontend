"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, History, Users, Menu, X, LogOut, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  // 1. Check for user in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [pathname]); // Re-check when route changes

  const isLoggedIn = !!user;

  // 2. Manual Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsOpen(false);
    router.push("/login");
  };

  const navItems = [
    { name: 'Track', href: '/dashboard', icon: <Home size={20} /> },
    { name: 'History', href: '/dashboard/history', icon: <History size={20} /> },
    { name: 'Contacts', href: '/dashboard/contacts', icon: <Users size={20} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 shadow-sm"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="SafeWalk Logo"
                fill
                className="object-contain group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight">SafeWalk</span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 font-bold text-sm transition ${pathname === item.href ? 'text-rose-600' : 'text-slate-500 hover:text-rose-500'
                      }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
                <div className="h-4 w-[1px] bg-slate-200 mx-2" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-900 hover:text-rose-600 font-bold text-sm flex items-center gap-1 transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-slate-600 font-bold text-sm hover:text-rose-600">Login</Link>
                <Link href="/register" className="bg-rose-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 transition">
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 active:bg-slate-50 transition"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 absolute w-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-6 space-y-2">
            {isLoggedIn ? (
              <>
                <div className="px-3 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{user?.name}</p>
                    {/* <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified User</p> */}
                  </div>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition ${pathname === item.href ? 'bg-rose-50 text-rose-600' : 'text-slate-600 active:bg-slate-50'
                      }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
                <div className="border-t border-slate-50 my-4" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-4 w-full text-rose-600 active:bg-rose-50 rounded-2xl transition font-black"
                >
                  <LogOut size={20} /> Logout Account
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 text-slate-900 font-bold border border-slate-100 rounded-2xl shadow-sm"
                >
                  <LogIn size={20} /> Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100"
                >
                  <UserPlus size={20} /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;