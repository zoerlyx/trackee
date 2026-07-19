"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Bell, Shield, LogOut, User as UserIcon } from "lucide-react";
import { User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    marketing: false,
  });

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const email = user.email || "";
    setUserEmail(email);

    setUserName(
      user.user_metadata?.full_name ||
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "User"
    );

    setCreatedAt(
      new Date(user.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  };

  const loadTransactions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);

    setTransactions(data || []);
  };

  useEffect(() => {
    const initialize = async () => {
      await loadUser();
      await loadTransactions();
      setLoading(false);
    };

    initialize();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-rose-200/50 via-sky-200/40 to-indigo-200/50 text-slate-800 antialiased flex flex-col relative">
      {/* Background Ambient Effects */}
      <div className="fixed top-1/4 left-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Content Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Profile</h1>
            <p className="text-xs text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="text-xs gap-1.5 rounded-lg shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            
          </Button>
        </div>

        {/* User Card Header */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white dark:border-slate-800 shadow-sm">
  <AvatarImage src="" />
  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
    <User className="h-8 w-8 sm:h-10 sm:w-10" />
  </AvatarFallback>
</Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-[#1a56db] text-white flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm hover:bg-[#1a56db]/90 transition-colors"
                >
                  <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">{userName}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs & Content */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border h-9 p-1">
            <TabsTrigger value="general" className="text-xs px-3 py-1">
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs px-3 py-1">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-3 py-1">
              Security
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border shadow-sm">
              <CardHeader className="py-3.5 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6 px-4 pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium" htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userName}
                      readOnly
                      className="bg-slate-50/50 dark:bg-slate-950/50 text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium" htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={userEmail}
                      readOnly
                      className="bg-slate-50/50 dark:bg-slate-950/50 text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Currency</Label>
                    <Input
                      value="Indonesian Rupiah (IDR)"
                      readOnly
                      className="bg-slate-50/50 dark:bg-slate-950/50 text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Member Since</Label>
                    <Input
                      value={createdAt}
                      readOnly
                      className="bg-slate-50/50 dark:bg-slate-950/50 text-xs h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border shadow-sm">
              <CardHeader className="py-3.5 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" /> Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6 px-4 pt-0 space-y-4">
                {[
                  {
                    key: "email" as const,
                    title: "Email Notifications",
                    desc: "Receive updates about your account via email.",
                  },
                  {
                    key: "push" as const,
                    title: "Push Notifications",
                    desc: "Get real-time alerts on your device.",
                  },
                  {
                    key: "weekly" as const,
                    title: "Weekly Summary",
                    desc: "Receive a weekly financial summary every Monday.",
                  },
                  {
                    key: "marketing" as const,
                    title: "Marketing Emails",
                    desc: "Receive tips, offers, and product updates.",
                  },
                ].map((item, idx, arr) => (
                  <div key={item.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, [item.key]: checked })
                        }
                      />
                    </div>
                    {idx < arr.length - 1 && <Separator className="bg-slate-100 dark:bg-slate-800" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border shadow-sm">
              <CardHeader className="py-3.5 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" /> Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6 px-4 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium" htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" placeholder="••••••••" className="text-xs h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium" htmlFor="new">New Password</Label>
                  <Input id="new" type="password" placeholder="••••••••" className="text-xs h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium" htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" className="text-xs h-9" />
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-[#1a56db] hover:bg-[#1a56db]/90 text-white rounded-lg text-xs h-8 px-4">
                    Update Password
                  </Button>
                </div>

                <Separator className="my-4 bg-slate-100 dark:bg-slate-800" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Two-Factor Authentication</p>
                    <p className="text-[11px] text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}