"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, History, Users, Menu, X, LogOut, ShieldCheck, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // status can be: "loading", "authenticated", or "unauthenticated"
  const isLoggedIn = status === "authenticated";

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: <Home size={20} /> },
    { name: 'History', href: '/dashboard/history', icon: <History size={20} /> },
    { name: 'Contacts', href: '/dashboard/contacts', icon: <Users size={20} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <ShieldCheck className="text-blue-600 group-hover:scale-110 transition-transform" size={28} />
            <span className="font-bold text-xl text-gray-900">SafeWalk</span>
          </Link>

          {/* DESKTOP NAV (Laptop) */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-1.5 font-medium transition ${
                      pathname === item.href ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
                <div className="h-6 w-[1px] bg-gray-200 ml-2" />
                <span className="text-sm text-gray-500 font-medium">Hi, {session?.user?.name}</span>
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })} 
                  className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600">Login</Link>
                <Link href="/register" className="bg-blue-600 text-white px-3 py-2 rounded-xl font-medium hover:bg-blue-700 shadow-md transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR (Dropdown) */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 absolute w-full shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-1">
            {isLoggedIn ? (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition ${
                      pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 active:bg-gray-50'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
                <div className="border-t border-gray-100 my-2" />
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })} 
                  className="flex items-center gap-3 p-3 w-full text-red-500 active:bg-red-50 rounded-xl transition font-medium"
                >
                  <LogOut size={20} /> Logout ({session?.user?.name})
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 p-2">
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center justify-center gap-2 p-3 text-gray-700 font-semibold border border-gray-200 rounded-xl"
                >
                  <LogIn size={20} /> Login
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200"
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