"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Trash2,
  Pencil,
  Loader2,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

const categoryColors: Record<string, string> = {
  Food: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400",
  Income: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400",
  Entertainment: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400",
  Transport: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:text-orange-400",
  Utilities: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-400",
  Housing: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
};

interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  notes?: string;
  transaction_date: string;
  description: string;
}

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Dialog State
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Edit Dialog State
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDate, setEditDate] = useState("");

  // Filter & Search
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const loadTransactions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const resetAddForm = () => {
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("");
    setNotes("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
  };

  const handleAddTransaction = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const parsedAmount = Math.abs(Number(amount));
      const finalAmount = type === "expense" ? -parsedAmount : parsedAmount;

      const { error } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          title,
          amount: finalAmount,
          type,
          category: category || "General",
          notes,
          transaction_date: transactionDate,
        },
      ]);

      if (error) throw error;

      setOpen(false);
      resetAddForm();
      await loadTransactions();
    } catch (err) {
      console.error("Failed to add transaction:", err);
      alert("Gagal menambahkan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditTitle(tx.title || "");
    setEditAmount(String(Math.abs(tx.amount || 0)));
    setEditType(tx.type || "expense");
    setEditCategory(tx.category || "");
    setEditNotes(tx.notes || "");
    setEditDate(tx.transaction_date || "");
    setEditOpen(true);
  };

  const handleUpdateTransaction = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    setIsSubmitting(true);
    try {
      const parsedAmount = Math.abs(Number(editAmount));
      const finalAmount = editType === "expense" ? -parsedAmount : parsedAmount;

      const { error } = await supabase
        .from("transactions")
        .update({
          title: editTitle,
          amount: finalAmount,
          type: editType,
          category: editCategory || "General",
          notes: editNotes,
          transaction_date: editDate,
        })
        .eq("id", selectedTx.id);

      if (error) throw error;

      setEditOpen(false);
      await loadTransactions();
    } catch (err) {
      console.error("Failed to update transaction:", err);
      alert("Gagal memperbarui transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus transaksi ini?")) return;

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      await loadTransactions();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert("Gagal menghapus transaksi.");
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.title?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || tx.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, search, filterCategory]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(transactions.map((tx) => tx.category).filter(Boolean))
    );
  }, [transactions]);

  // Derived Totals for Card Header Summary
  const { totalIncome, totalExpense } = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        const val = Math.abs(tx.amount || 0);
        if (tx.type === "income" || tx.amount > 0) acc.totalIncome += val;
        else acc.totalExpense += val;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-rose-200/50 via-sky-200/40 to-indigo-200/50 text-slate-800 flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <p className="text-xs font-medium text-slate-600 mt-2">Memuat riwayat aktivitas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-rose-200/50 via-sky-200/40 to-indigo-200/50 text-slate-800 antialiased flex flex-col relative">
      <div className="fixed top-1/4 left-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-5">
        {/* Header Section */}
        <div className="flex flex-row items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Activity
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Manage and monitor all your transaction cash flow records.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>

        {/* Enhanced Main Content Card */}
        <Card className="border border-white/80 bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden transition-all">
          {/* Card Dynamic Mini Summary */}
          <div className="grid grid-cols-2 divide-x divide-slate-100 bg-white/40 border-b border-slate-100/80 p-3 sm:p-4">
            <div className="flex items-center gap-3 px-2 sm:px-4">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Income</p>
                <p className="text-sm sm:text-base font-bold text-emerald-600 tracking-tight">
                  +{formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 sm:px-4">
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <TrendingDown className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Expense</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                  -{formatCurrency(totalExpense)}
                </p>
              </div>
            </div>
          </div>

          <CardHeader className="p-4 pb-3 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search transaction..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white/80 border-slate-200/80 rounded-xl focus-visible:ring-blue-500"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-44 h-9 text-xs bg-white/80 border-slate-200/80 rounded-xl">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 max-w-[300px] h-8 bg-slate-200/50 p-0.5 rounded-xl">
                <TabsTrigger value="all" className="text-xs h-7 rounded-lg">All</TabsTrigger>
                <TabsTrigger value="income" className="text-xs h-7 rounded-lg">Income</TabsTrigger>
                <TabsTrigger value="expense" className="text-xs h-7 rounded-lg">Expense</TabsTrigger>
              </TabsList>

              {["all", "income", "expense"].map((tab) => {
                const currentList = filteredTransactions.filter(
                  (tx) => tab === "all" || tx.type === tab
                );

                return (
                  <TabsContent key={tab} value={tab} className="mt-0 space-y-2">
                    {currentList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-200/80 p-6 bg-white/30">
                        <Receipt className="h-9 w-9 text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-600">
                          Tidak ada transaksi ditemukan
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Coba ubah kata kunci pencarian atau filter kategori.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/60 bg-white/90 overflow-hidden shadow-xs">
                        {currentList.map((tx) => {
  // 1. Cek tipe secara eksplisit berdasarkan `type`
  // Jika type tidak ada, fallback ke pembandingan angka < 0 atau > 0
  const isIncome = tx.type ? tx.type === "income" : Number(tx.amount) > 0;

  return (
    <div
      key={tx.id}
      className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar Inisial */}
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
            isIncome
              ? "bg-emerald-100/80 text-emerald-700"
              : "bg-rose-100/80 text-rose-700" // Diubah ke warna merah untuk expense
          }`}
        >
          {tx.title?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate text-slate-800">
            {tx.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {tx.category && (
              <Badge
                variant="outline"
                className={`text-[10px] font-medium px-2 py-0 rounded-md border ${
                  categoryColors[tx.category] ||
                  "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {tx.category}
              </Badge>
            )}
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5" />
              {tx.transaction_date}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          {/* Nominal & Panah Indicator */}
          <div
            className={`flex items-center justify-end gap-0.5 text-xs font-bold ${
              isIncome
                ? "text-emerald-600"
                : "text-rose-600" // Warna teks pengeluaran jadi merah
            }`}
          >
            <span>
              {isIncome ? "+" : "-"}
              {formatCurrency(Math.abs(tx.amount || 0))}
            </span>
            {isIncome ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" /> // Panah bawah merah untuk expense
            )}
          </div>
          {tx.notes && (
            <p className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-[180px]">
              {tx.notes}
            </p>
          )}
        </div>

        <div className="flex items-center border-l border-slate-100 pl-2 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditDialog(tx)}
            className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(tx.id)}
            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
})}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* --- ADD TRANSACTION DIALOG --- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px] p-5 rounded-2xl">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-base font-bold text-slate-900">Add New</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter the details of your income or expenses.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTransaction} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Title</Label>
              <Input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Gaji, Belanja Bulanan, Makanan..."
                className="h-8 text-xs rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Amount (Rp)</Label>
                <Input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="h-8 text-xs rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Transaction Type</Label>
                <Select value={type} onValueChange={(val: "income" | "expense") => setType(val)}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense" className="text-xs">Expense</SelectItem>
                    <SelectItem value="income" className="text-xs">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Category</Label>
                <Input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Makanan, Gaji, dll"
                  className="h-8 text-xs rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Date</Label>
                <Input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="h-8 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Note (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan..."
                className="h-8 text-xs rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-8 px-3 text-xs rounded-lg"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- EDIT TRANSACTION DIALOG --- */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[420px] p-5 rounded-2xl">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-base font-bold text-slate-900">Edit Transaction</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update your preferred transaction information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateTransaction} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Title</Label>
              <Input
                required
                className="h-8 text-xs rounded-lg"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Amount (Rp)</Label>
                <Input
                  required
                  type="number"
                  className="h-8 text-xs rounded-lg"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Transaction Type</Label>
                <Select value={editType} onValueChange={(val: "income" | "expense") => setEditType(val)}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income" className="text-xs">Income</SelectItem>
                    <SelectItem value="expense" className="text-xs">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Category</Label>
                <Input
                  className="h-8 text-xs rounded-lg"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Date</Label>
                <Input
                  required
                  type="date"
                  className="h-8 text-xs rounded-lg"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Note (Optional)</Label>
              <Input
                className="h-8 text-xs rounded-lg"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="h-8 px-3 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}