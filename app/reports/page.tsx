"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar } from "lucide-react";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setTransactions(data || []);
    setLoading(false);
  };

  // 1. Akumulasi Total Income & Expense (Memastikan nilai selalu positif)
  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0);

  const totalSavings = totalIncome - totalExpense;

  // 2. Pengelompokan Data Bulanan & Urutan Kronologis
  const monthlyMap: Record<
    string,
    {
      income: number;
      expense: number;
      firstDate: Date;
    }
  > = {};

  transactions.forEach((tx) => {
    const txDate = new Date(tx.transaction_date);
    const monthKey = txDate.toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        income: 0,
        expense: 0,
        firstDate: new Date(txDate.getFullYear(), txDate.getMonth(), 1),
      };
    }

    const val = Math.abs(Number(tx.amount) || 0);
    if (tx.type === "income") {
      monthlyMap[monthKey].income += val;
    } else {
      monthlyMap[monthKey].expense += val;
    }
  });

  // Urutkan data berdasarkan waktu/bulan
  const reportData = Object.entries(monthlyMap)
    .sort((a, b) => a[1].firstDate.getTime() - b[1].firstDate.getTime())
    .map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
      savings: values.income - values.expense,
    }));

  // 3. Category Data untuk Donut Chart
  const categoryData = Object.entries(
    transactions
      .filter((tx) => tx.type === "expense")
      .reduce((acc: Record<string, number>, tx) => {
        const category = tx.category || "Other";
        acc[category] = (acc[category] || 0) + Math.abs(Number(tx.amount) || 0);
        return acc;
      }, {})
  ).map(([name, value], index) => {
    const colors = [
      "#1a56db",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#64748b",
      "#ec4899",
      "#06b6d4",
    ];

    return {
      name,
      value,
      color: colors[index % colors.length],
    };
  });

  // 4. Perhitungan Savings Trend & Avg Savings Rate
  const savingsTrend = reportData.map((item) => ({
    month: item.month,
    rate:
      item.income === 0
        ? 0
        : Number(((item.savings / item.income) * 100).toFixed(1)),
  }));

  const avgSavingsRate =
    savingsTrend.length === 0
      ? "0.0"
      : (
          savingsTrend.reduce((acc, curr) => acc + curr.rate, 0) /
          savingsTrend.length
        ).toFixed(1);

  const summaryCards = [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      change: "Income",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Total Expense",
      value: formatCurrency(totalExpense),
      change: "Expense",
      trend: "down",
      icon: Calendar,
    },
    {
      title: "Net Savings",
      value: formatCurrency(totalSavings),
      change: "Balance",
      trend: totalSavings >= 0 ? "up" : "down",
      icon: ArrowUpRight,
    },
    {
      title: "Avg Savings Rate",
      value: `${avgSavingsRate}%`,
      change: "Current",
      trend: Number(avgSavingsRate) >= 20 ? "up" : "down",
      icon: ArrowDownRight,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center  bg-gradient-to-tr from-rose-200/50 via-sky-200/40 to-indigo-200/50 text-slate-800 text-sm">
        Loading Report...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-rose-200/50 via-sky-200/40 to-indigo-200/50 text-slate-800 antialiased flex flex-col relative">
      {/* Background Ambient Effects */}
      <div className="fixed top-1/4 left-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reports</h1>
          <p className="text-xs text-muted-foreground">
            Detailed financial reports and analytics.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border shadow-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pb-3.5 px-4 pt-0">
                  <div className="text-lg font-bold tracking-tight">
                    {card.value}
                  </div>
                  <div
                    className={`flex items-center text-[10px] mt-0.5 ${
                      card.trend === "up" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {card.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {card.change} summary
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs & Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 h-10 p-1 rounded-xl shadow-inner">
              <TabsTrigger
                value="overview"
                className="text-xs font-medium px-4 py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="text-xs font-medium px-4 py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Income
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="text-xs font-medium px-4 py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Expenses
              </TabsTrigger>
              <TabsTrigger
                value="savings"
                className="text-xs font-medium px-4 py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Savings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-2xl overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Monthly Overview
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Comparison of income, expenses, and savings
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                    <span className="text-slate-600 dark:text-slate-400">Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                    <span className="text-slate-600 dark:text-slate-400">Expense</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-600/50" />
                    <span className="text-slate-600 dark:text-slate-400">Savings</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData} barGap={6}>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e2e8f0"
                      vertical={false}
                      className="dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000000)}M`}
                      dx={-8}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white p-3 rounded-xl shadow-2xl text-xs space-y-1.5">
                              <p className="font-semibold text-slate-300 border-b border-slate-800 pb-1">
                                {label}
                              </p>
                              {payload.map((entry: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <span
                                    style={{ color: entry.color }}
                                    className="font-medium capitalize"
                                  >
                                    {entry.dataKey}:
                                  </span>
                                  <span className="font-mono font-semibold">
                                    {formatCurrency(entry.value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="income"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="expense"
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="savings"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INCOME TAB */}
          <TabsContent value="income" className="space-y-4 focus-visible:outline-none">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-2xl overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Income Trend
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Monthly revenue growth trend
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  + Dynamic Growth
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <filter id="glowIncome" x1="-20%" y1="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e2e8f0"
                      vertical={false}
                      className="dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000000)}M`}
                      dx={-8}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white px-3.5 py-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                              <p className="text-slate-400 text-[11px]">{label}</p>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                <span className="font-semibold font-mono text-emerald-400 text-sm">
                                  {formatCurrency(payload[0].value as number)}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#colorIncome)"
                      style={{ filter: "url(#glowIncome)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXPENSES TAB */}
          <TabsContent value="expenses" className="space-y-4 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Expense Trend Chart */}
              <Card className="lg:col-span-7 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-2xl overflow-hidden">
                <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Expense Trend
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Periodic expenditure flow graph
                  </p>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={reportData}>
                      <defs>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.0} />
                        </linearGradient>
                        <filter id="glowExpense" x1="-20%" y1="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.3" />
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="#e2e8f0"
                        vertical={false}
                        className="dark:stroke-slate-800"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${Math.round(v / 1000000)}M`}
                        dx={-8}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white px-3.5 py-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                                <p className="text-slate-400 text-[11px]">{label}</p>
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                                  <span className="font-semibold font-mono text-rose-400 text-sm">
                                    {formatCurrency(payload[0].value as number)}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fill="url(#colorExpense)"
                        style={{ filter: "url(#glowExpense)" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expense Category Donut Chart */}
              <Card className="lg:col-span-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-2xl overflow-hidden flex flex-col justify-between">
                <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Expense by Category
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Distribution of expenditure
                  </p>
                </CardHeader>
                <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-center">
                  {categoryData && categoryData.length > 0 ? (
                    <>
                      <div className="w-full h-[180px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart key={categoryData.length}>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                              nameKey="name"
                              stroke="none"
                            >
                              {categoryData.map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color || "#3b82f6"}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0];
                                  return (
                                    <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white px-3 py-1.5 rounded-xl shadow-2xl text-xs flex items-center gap-2">
                                      <span
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            data.payload.color || "#3b82f6",
                                        }}
                                      />
                                      <span className="font-medium">
                                        {data.name}:
                                      </span>
                                      <span className="font-mono font-semibold">
                                        {formatCurrency(Number(data.value))}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend List */}
                      <div className="space-y-2 mt-2 max-h-32 overflow-y-auto pr-1 text-xs divide-y divide-slate-100 dark:divide-slate-800/50">
                        {categoryData.map((cat: any) => (
                          <div
                            key={cat.name}
                            className="flex items-center justify-between pt-2 first:pt-0"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full shadow-sm"
                                style={{
                                  backgroundColor: cat.color || "#3b82f6",
                                }}
                              />
                              <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {cat.name}
                              </span>
                            </div>
                            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                              {formatCurrency(Number(cat.value))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Belum ada data pengeluaran.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SAVINGS TAB */}
          <TabsContent value="savings" className="space-y-4 focus-visible:outline-none">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-2xl overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Savings Rate Trend
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Savings as a percentage of income
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
                  Target: 20%+
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={savingsTrend}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                      <filter id="glowSavings" x1="-20%" y1="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.3" />
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e2e8f0"
                      vertical={false}
                      className="dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                      dx={-8}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white px-3.5 py-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                              <p className="text-slate-400 text-[11px]">{label}</p>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="font-semibold font-mono text-blue-400 text-sm">
                                  {payload[0].value}%
                                </span>
                                <span className="text-slate-400">Savings Rate</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#colorSavings)"
                      style={{ filter: "url(#glowSavings)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}