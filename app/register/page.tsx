"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (!agreed) {
      setErrorMessage("Please accept the Terms of Service to proceed.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setErrorMessage("An unexpected registration error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage("");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (err) {
      setErrorMessage("Failed to initiate Google sign-up.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className={`${plusJakarta.className} min-h-screen w-full bg-gradient-to-tr from-rose-200/50 via-sky-200/40 to-indigo-200/50 text-slate-800 antialiased relative flex flex-col md:flex-row`}
    >
      {/* Ambient Background Glow */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* --- SISI KIRI: BRANDING & HERO (Desktop Only) --- */}
      <div className="relative hidden md:flex md:w-1/2 md:h-screen flex-col justify-between p-8 lg:p-12 border-r border-white/60 bg-white/20 backdrop-blur-md shrink-0 sticky top-0">
          {/* Header Logo */}
          <div className="relative z-10 flex flex-col items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Trackee
            </span>
          </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-5 max-w-md my-auto"> 
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.15] text-slate-900">
            Start building your <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              financial architecture.
            </span>
          </h1>

          <p className="text-slate-600 text-xs leading-relaxed font-normal">
            Configure automated transaction logging, analyze real-time budget velocity, and secure your asset growth with Trackee.
          </p>

          {/* Micro Feature Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm backdrop-blur-md space-y-1">
              <Zap className="w-4 h-4 text-blue-600 mb-3" />
              <p className="text-[11px] font-bold text-slate-900">Automated Ledger</p>
              <p className="text-[10px] text-slate-500 leading-tight">Multi-currency real-time tracking</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm backdrop-blur-md space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mb-3" />
              <p className="text-[11px] font-bold text-slate-900">Encrypted Sync</p>
              <p className="text-[10px] text-slate-500 leading-tight">Bank-level privacy & protocols</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-300/60 pt-4">
          <span>© {new Date().getFullYear()} Trackee Platform Inc.</span>
          <div className="flex gap-3">
            <span className="hover:text-slate-800 cursor-pointer transition-colors">Terms</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </div>

      {/* --- SISI KANAN: FORM REGISTER (Full Scrollable Area) --- */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-8 backdrop-blur-xl bg-white/100 overflow-y-auto">
        
        {/* Mobile Header Logo */}
        <div className="flex items-center gap-2 md:hidden mb-4">
          <span className="text-base font-bold tracking-tight text-slate-900">Trackee</span>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-[320px] mx-auto my-auto space-y-3.5 py-4">
          
          {/* Header Copywriting */}
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Create Workspace
            </h2>
            <p className="text-[11px] text-slate-500">
              Set up your credentials to begin
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-600 text-[11px] animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-700 text-[11px] animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleRegister} className="space-y-2.5">
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-[11px] font-medium text-slate-600">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adrian Sanjaya"
                  className="pl-8 h-8 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-[11px] font-medium text-slate-600">
                Email Account
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adrian@gmail.com"
                  className="pl-8 h-8 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Security Key (Password) */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-[11px] font-medium text-slate-600">
                Security Key (Password)
              </Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-8 pr-8 h-8 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg transition-all shadow-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            {/* Checkbox Terms */}
            <div className="flex items-start space-x-2 pt-0.5">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-0.5 h-3.5 w-3.5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded"
              />
              <label
                htmlFor="terms"
                className="text-[10px] text-slate-500 leading-tight cursor-pointer select-none"
              >
                I agree to the{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-8.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all shadow-xs active:scale-[0.99] mt-1"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Initialize Account"}
            </Button>
          </form>

          {/* Separator Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-white/80 backdrop-blur-xs px-2 font-medium uppercase tracking-wider text-slate-400">
                Single Sign-On
              </span>
            </div>
          </div>

          {/* OAuth Google Button */}
          <Button
            type="button"
            variant="outline"
            disabled={loading || googleLoading}
            onClick={handleGoogleSignUp}
            className="w-full h-8.5 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium gap-2 transition-all shadow-xs active:scale-[0.99]"
          >
            {googleLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Sign up with Google
          </Button>

          {/* Footer Navigation */}
          <p className="text-center text-[11px] text-slate-500 pt-2">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign In to Workspace
            </Link>
          </p>
        </div>

        {/* Footer Space Balance */}
        <div className="hidden md:block" />
      </div>
    </div>
  );
}