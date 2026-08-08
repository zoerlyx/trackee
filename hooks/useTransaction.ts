import { useState, useEffect, useCallback, useMemo } from "react";
// Import instance supabase dari supabase.ts Anda
import { supabase } from "@/lib/supabase"; // Sesuaikan path lokasi berkas supabase.ts Anda
import { formatCurrency } from "@/lib/format-currency"; // Sesuaikan path formatCurrency Anda

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  notes?: string;
  transaction_date: string;
  created_at?: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch data transaksi dari Supabase
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err: any) {
      console.error("Fetch transactions error:", err);
      setError(err.message || "Gagal memuat transaksi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 2. Kalkulasi Terpusat (Single Source of Truth)
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const type = tx.type?.toLowerCase();

      if (type === "income") {
        income += amt;
      } else if (type === "expense") {
        expense += amt;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [transactions]);

  // 3. Format nilai angka langsung siap pakai untuk UI
  const formattedStats = useMemo(() => {
    return {
      formattedIncome: formatCurrency(totalIncome),
      formattedExpense: formatCurrency(totalExpense),
      formattedBalance: formatCurrency(balance),
    };
  }, [totalIncome, totalExpense, balance]);

  return {
    transactions,
    loading,
    error,
    refreshTransactions: fetchTransactions,
    totalIncome,
    totalExpense,
    balance,
    ...formattedStats,
  };
}