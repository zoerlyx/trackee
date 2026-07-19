"use client";

import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogOut, Wallet } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Activity", href: "/activity" },
  { label: "Reports", href: "/reports" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to log out", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    /* Sticky tetap aktif agar menempel saat di-scroll */
    <header className="bg-transparent z-50 w-full px-8 pt-4 pb-4 fixed top-0 left-0 right-0pointer-events-none">
      <nav className="max-w-7xl mx-auto rounded-xl bg-white/20 border border-white/80 shadow-md backdrop-blur-md px-4 py-1.5 flex items-center justify-between transition-all">
        
        {/* Brand / Logo (Kiri) */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900 ml-1">
              Trackee
            </span>
          </Link>
        </div>

        {/* Menu Navigasi + Logout (Kanan) */}
        <div className="flex items-center gap-2">
          {/* Menu Navigasi */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-1 rounded-lg text-xs font-semibold transition-all duration-200",
                    active
                      ? "bg-white/70 text-blue-500 shadow-xs border border-white/60 backdrop-blur-md"
                      : "text-black-700 hover:text-slate-900 hover:bg-black/10"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1.5 ml-4 rounded-lg text-slate-700 hover:text-white bg-slate-500/15 hover:bg-black transition-all border border-slate-300 hover:border-red-200/40"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </nav>
    </header>
  );
}