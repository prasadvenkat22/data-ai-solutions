import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  ArrowLeftRight, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle, Search,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { TransactionCreate, TransactionResponse } from '@/types';

const emptyForm: TransactionCreate = {
  amount: 0,
  category: '',
  description: '',
  is_income: false,
  date: new Date().toISOString().split('T')[0],
  user_id: undefined,
  customer_id: undefined,
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TransactionCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.transactions.list().then(setTransactions).catch(() => setTransactions([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.transactions.create(form);
      setTransactions((prev) => [...prev, created]);
      setSuccess('Transaction recorded successfully.');
      setShowForm(false);
      setForm(emptyForm);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.transactions.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setDeleteId(null);
      setSuccess('Transaction deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = transactions.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalIncome = filtered.filter((t) => t.is_income).reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => !t.is_income).reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <Head><title>Transactions — DataAI Solutions</title></Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Transactions</h1>
              <p className="text-slate-400 mt-1">Track income and expenses.</p>
            </div>
            <button
              onClick={() => { setForm(emptyForm); setError(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 mb-6 text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-slate-400 text-xs">Total Income</p>
              <p className="text-emerald-300 font-bold text-xl">${totalIncome.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-slate-400 text-xs">Total Expenses</p>
              <p className="text-red-300 font-bold text-xl">${totalExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description or category…"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ArrowLeftRight className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No transactions match your search.' : 'No transactions yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60">
                <tr>
                  {['Type', 'Amount', 'Category', 'Description', 'Date', 'User ID', 'Customer ID', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      {t.is_income ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 rounded-full px-2.5 py-1">
                          <TrendingUp className="w-3 h-3" /> Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-900/40 text-red-300 border border-red-700/40 rounded-full px-2.5 py-1">
                          <TrendingDown className="w-3 h-3" /> Expense
                        </span>
                      )}
                    </td>
                    <td className={`px-5 py-4 font-bold ${t.is_income ? 'text-emerald-300' : 'text-red-300'}`}>
                      {t.is_income ? '+' : '-'}${t.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{t.category}</td>
                    <td className="px-5 py-4 text-slate-400 max-w-xs truncate">{t.description}</td>
                    <td className="px-5 py-4 text-slate-400">{t.date}</td>
                    <td className="px-5 py-4 text-slate-500">{t.user_id ? `#${t.user_id}` : '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{t.customer_id ? `#${t.customer_id}` : '—'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900">
              <h3 className="text-white font-bold text-lg">Add Transaction</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
                <div className="flex gap-3">
                  {[{ label: 'Income', value: true }, { label: 'Expense', value: false }].map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setForm({ ...form, is_income: opt.value })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        form.is_income === opt.value
                          ? opt.value ? 'bg-emerald-700 border-emerald-600 text-white' : 'bg-red-700 border-red-600 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount *</label>
                  <input
                    required type="number" min={0} step="0.01"
                    value={form.amount || ''}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Date *</label>
                  <input
                    required type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category *</label>
                <input
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Consulting, Software, Hardware"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                <textarea
                  required rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the transaction…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">User ID</label>
                  <input
                    type="number" min={1}
                    value={form.user_id || ''}
                    onChange={(e) => setForm({ ...form, user_id: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer ID</label>
                  <input
                    type="number" min={1}
                    value={form.customer_id || ''}
                    onChange={(e) => setForm({ ...form, customer_id: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving…' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">Delete Transaction?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
