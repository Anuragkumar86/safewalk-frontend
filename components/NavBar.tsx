"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, History, Users, Menu, X, LogOut, ShieldCheck, LogIn, UserPlus, Compass } from 'lucide-react';
import Image from 'next/image';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [pathname]);

  const isLoggedIn = !!user;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsOpen(false);
    router.push("/login");
  };

  const navItems = [
    { name: 'Track', href: '/dashboard', icon: <Compass size={20} /> },
    { name: 'History', href: '/dashboard/history', icon: <History size={20} /> },
    { name: 'Contacts', href: '/dashboard/contacts', icon: <Users size={20} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-zinc-950 border-b border-zinc-800/50 z-[100] shadow-2xl transition-all duration-300"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 p-1.5 bg-rose-600/10 border border-rose-500/20 rounded-xl group-hover:bg-rose-600/20 transition-all duration-300">
              <Image
                src="/logo.png"
                alt="SafeWalk Logo"
                fill
                className="object-contain p-2 group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-zinc-100 leading-tight tracking-tight">SafeWalk</span>

            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${pathname === item.href
                        ? 'bg-rose-600/10 text-rose-500 border border-rose-500/20'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                      }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
                <div className="h-6 w-[1px] bg-zinc-800 mx-4" />
                <div className="flex items-center gap-3 mr-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest hidden lg:block">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-zinc-400 font-bold text-sm hover:text-zinc-100 px-4">Login</Link>
                <Link href="/register" className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-500 shadow-lg shadow-rose-950/20 transition-all active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden ">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-3 rounded-2xl transition-all active:scale-90 ${isOpen ? 'bg-rose-500 text-white' : 'bg-zinc-900 text-zinc-400'
                }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FULL SCREEN MENU */}
      <div className={`md:hidden fixed inset-0 top-[calc(env(safe-area-inset-top,0px)+80px)] 
bg-zinc-950 transition-all duration-500 ease-in-out z-50 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}>

        <div className="px-6 py-8 flex flex-col h-full">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-4 mb-10 p-4 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-black text-zinc-100 tracking-tight">{user?.name}</p>
                  <p className="text-xs text-rose-500 font-black uppercase tracking-widest">Active Guardian</p>
                </div>
              </div>

              <div className="space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] font-black text-lg transition-all ${pathname === item.href
                        ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/40'
                        : 'text-zinc-400 bg-zinc-900/30 active:bg-zinc-800'
                      }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pb-10">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 p-5 w-full bg-zinc-900 text-rose-500 border border-rose-500/20 rounded-3xl font-black transition-all active:scale-95"
                >
                  <LogOut size={22} /> Logout Account
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 p-5 bg-zinc-900 text-zinc-100 font-black rounded-3xl border border-zinc-800 shadow-sm"
              >
                <LogIn size={22} /> Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 p-5 bg-rose-600 text-white rounded-3xl font-black shadow-2xl shadow-rose-900/30"
              >
                <UserPlus size={22} /> Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;