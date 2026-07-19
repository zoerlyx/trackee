"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Plus,
  Calendar,
  PieChart as PieChartIcon,
  Download,
  X,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: "income" | "expense" | string;
  category: string;
  notes?: string;
  transaction_date: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        setCurrentUser(user);

        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        }

        const { data, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("transaction_date", { ascending: false });

        if (txError) throw txError;
        setTransactions(data || []);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const loadTransactions = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error("Error loading transactions:", err);
    }
  }, [currentUser]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const amt = Math.abs(Number(tx.amount) || 0);
      const normalizedType = (tx.type || "").toLowerCase();

      if (normalizedType === "income" || normalizedType === "pemasukan") {
        income += amt;
      } else if (normalizedType === "expense" || normalizedType === "pengeluaran") {
        expense += amt;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter((tx) => {
      const normalizedType = (tx.type || "").toLowerCase();
      return normalizedType === "expense" || normalizedType === "pengeluaran";
    });

    const grouped = expenses.reduce((acc: Record<string, number>, tx) => {
      const cat = tx.category || "Umum";
      acc[cat] = (acc[cat] || 0) + Math.abs(Number(tx.amount) || 0);
      return acc;
    }, {});

    const colors = ["#3b82f6", "#10b981", "#f43f5e", "#8b5cf6", "#0284c7", "#f59e0b"];

    return Object.entries(grouped).map(([name, value], index) => ({
      name,
      value: Number(value),
      color: colors[index % colors.length],
    }));
  }, [transactions]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Masukkan jumlah nominal yang valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          user_id: currentUser.id,
          title,
          amount: parsedAmount,
          type,
          category: category.trim() || "Umum",
          notes,
          transaction_date:
            transactionDate || new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

      setOpen(false);
      setTitle("");
      setAmount("");
      setCategory("");
      setNotes("");
      setTransactionDate("");

      await loadTransactions();
    } catch (err: any) {
      console.error("Add transaction error:", err);
      alert("Gagal menambahkan transaksi: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    if (!transactions || transactions.length === 0) {
      alert("Tidak ada data transaksi untuk diexport.");
      return;
    }

    const sortedTransactions = [...transactions].sort(
      (a, b) =>
        new Date(a.transaction_date).getTime() -
        new Date(b.transaction_date).getTime()
    );

    const incomeData = sortedTransactions
      .filter((tx) => {
        const t = (tx.type || "").toLowerCase();
        return t === "income" || t === "pemasukan";
      })
      .map((tx, index) => ({
        No: index + 1,
        Tanggal: tx.transaction_date,
        Judul: tx.title || "-",
        Kategori: tx.category || "-",
        "Jumlah (Rp)": Math.abs(Number(tx.amount) || 0),
        Catatan: tx.notes || "-",
      }));

    const expenseData = sortedTransactions
      .filter((tx) => {
        const t = (tx.type || "").toLowerCase();
        return t === "expense" || t === "pengeluaran";
      })
      .map((tx, index) => ({
        No: index + 1,
        Tanggal: tx.transaction_date,
        Judul: tx.title || "-",
        Kategori: tx.category || "-",
        "Jumlah (Rp)": Math.abs(Number(tx.amount) || 0),
        Catatan: tx.notes || "-",
      }));

    let runningBalance = 0;
    const balanceData = sortedTransactions.map((tx, index) => {
      const amt = Math.abs(Number(tx.amount) || 0);
      const type = (tx.type || "").toLowerCase();
      const isIncome = type === "income" || type === "pemasukan";

      if (isIncome) {
        runningBalance += amt;
      } else {
        runningBalance -= amt;
      }

      return {
        No: index + 1,
        Tanggal: tx.transaction_date,
        Judul: tx.title || "-",
        Tipe: isIncome ? "Pemasukan" : "Pengeluaran",
        Kategori: tx.category || "-",
        "Pemasukan (Rp)": isIncome ? amt : 0,
        "Pengeluaran (Rp)": !isIncome ? amt : 0,
        "Saldo Akhir (Rp)": runningBalance,
      };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(incomeData), "Income");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expenseData), "Expense");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(balanceData), "Balance");

    XLSX.writeFile(
      workbook,
      `Report_Financial_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const stats = [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      trend: "up",
      change: `${transactions.filter((tx) => (tx.type || "").toLowerCase() === "income" || (tx.type || "").toLowerCase() === "pemasukan").length} Transaactions`,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-600",
    },
    {
      title: "Total Expense",
      value: formatCurrency(totalExpense),
      icon: Calendar,
      trend: "down",
      change: `${transactions.filter((tx) => (tx.type || "").toLowerCase() === "expense" || (tx.type || "").toLowerCase() === "pengeluaran").length} Transactions`,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600",
      textColor: "text-rose-600",
    },
    {
      title: "Balance",
      value: formatCurrency(balance),
      icon: ArrowUpRight,
      trend: balance >= 0 ? "up" : "down",
      change: "Current Balance",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      textColor: balance >= 0 ? "text-emerald-600" : "text-rose-600",
    },
    {
      title: "Transactions",
      value: transactions.length.toString(),
      icon: ArrowDownRight,
      trend: "up",
      change: "Total Transactions",
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-600",
      textColor: "text-slate-600",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-rose-200/50 via-sky-200/40 to-indigo-200/50 text-slate-800 antialiased flex flex-col relative">
      <div className="fixed top-1/4 left-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Financial Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Welcome Back, <span className="font-medium text-slate-900">{userName}</span>! Here is a summary of your financial activity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportExcel}
              className="bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-medium border border-slate-200/80 active:scale-[0.99] gap-1.5 rounded-lg px-3.5 h-8"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Excel</span>
            </Button>

            <Button
              onClick={() => {
                setType("expense");
                setTitle("");
                setAmount("");
                setCategory("");
                setNotes("");
                setTransactionDate("");
                setOpen(true);
              }}
              className="rounded-lg transition-all active:scale-[0.99] gap-1.5 bg-blue-700 hover:bg-slate-800 text-white px-3.5 h-8 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Transaction</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">{stat.title}</span>
                  <div className={`p-1.5 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900 tracking-tight">{stat.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.textColor} mt-1`}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Capital Flow History</h2>
                <p className="text-xs text-slate-500 font-normal">Spending summary per category</p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                Active Transactions
              </span>
            </div>

            {categoryData.length > 0 ? (
              <div className="space-y-3 pt-2">
                {categoryData.map((cat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <span className="text-slate-500">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (cat.value / (totalExpense || 1)) * 100)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-56 w-full rounded-xl bg-gradient-to-b from-white/40 to-white/10 border border-white/60 flex flex-col items-center justify-center space-y-2 p-4 text-center">
                <PieChartIcon className="w-8 h-8 text-blue-600/60" />
                <p className="text-xs font-medium text-slate-700">Analytics Graph Area</p>
                <p className="text-xs text-slate-500 max-w-xs font-normal">
                  Belum ada data pengeluaran ter-kategori untuk ditampilkan.
                </p>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Recent Transactions</h2>
                <Link href="/activity" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-xs">Memuat transaksi...</span>
                  </div>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => {
                    const normalizedType = (tx.type || "").toLowerCase();
                    const isIncome = normalizedType === "income" || normalizedType === "pemasukan";
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 border border-white/60"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-900">
                              {tx.title || "Tanpa Judul"}
                            </p>
                            <p className="text-[11px] text-slate-500 font-normal">
                              {tx.transaction_date
                                ? new Date(tx.transaction_date).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "Baru saja"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            isIncome ? "text-emerald-600" : "text-slate-900"
                          }`}
                        >
                          {isIncome ? "+" : "-"}{formatCurrency(Math.abs(Number(tx.amount) || 0))}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 font-normal">
                    Belum ada data transaksi.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-300/40 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-normal">Real-time bank ledger sync active</span>
            </div>
          </div>
        </div>
      </main>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/90 border border-white/80 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Add new transaction</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Gaji, Belanja Bulanan"
                  className="w-full px-3 py-2 rounded-lg bg-white/70 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Amount (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-white/70 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "income" | "expense")}
                    className="w-full px-3 py-2 rounded-lg bg-white/70 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Makanan, Transport, dll"
                    className="w-full px-3 py-2 rounded-lg bg-white/70 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/70 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Note</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan..."
                  className="w-full px-3 py-2 rounded-lg bg-white/70 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-300/60 bg-white/20 backdrop-blur-md px-4 sm:px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
        <span>© {new Date().getFullYear()} Trackee Platform</span>
        <div className="flex gap-3">
          <span className="hover:text-slate-800 cursor-pointer transition-colors">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-800 cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}