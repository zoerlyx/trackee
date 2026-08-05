"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet } from "lucide-react";

export default function Home() {
  return (
    /* Global Page Background - Style & Gradient dipindahkan ke sini */
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-tr from-rose-200/50 via-sky-200/40 to-indigo-200/50 text-slate-800 antialiased relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* Ambient Background Glow (Global) */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/60 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-200/50 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Main Container - Card Style/BG Dihapus */}
      <div className="w-full max-w-4xl h-auto min-h-[380px] px-8 py-8 sm:px-12 sm:py-10 md:px-14 md:py-12 flex flex-col justify-between items-center text-center relative">
        
        <div className="relative z-10 flex flex-col items-start gap-3">
          <div className="relative z-10 grid grid-cols-1 justify-items-center text-center w-full gap-2">
            {/* Baris 1: Logo */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wallet className="h-5 w-5" />
            </div>

            {/* Baris 2: Judul */}
            <span className="text-2xl font-bold tracking-tight text-slate-900 block">
              Trackee
            </span>
          </div>
        </div>
        

        {/* Hero Text */}
        <div className="relative z-10 my-auto space-y-3 py-4 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.16]">
            Precision analytics for your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              capital & savings.
            </span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-normal">
            Track income flows, monitor recurring expenses, and optimize your financial trajectory with an enterprise-ready analytical workspace.
          </p>
        </div>

        {/* Action Buttons & Links */}
        <div className="relative z-10 flex flex-col items-center gap-3.5 w-full">
          {/* Equal Width Buttons */}
          <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-36 h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]">
                Log In
              </Button>
            </Link>
            
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-36 h-10 bg-white/80 hover:bg-white text-slate-700 border-slate-200/80 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98]">
                Create Account
              </Button>
            </Link>
          </div> 
        </div>

      </div>
    </div>
  );
}