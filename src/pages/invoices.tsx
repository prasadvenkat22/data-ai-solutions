import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  FileText, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle, Search, Pencil,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { InvoiceCreate, InvoiceResponse } from '@/types';

const emptyForm: InvoiceCreate = {
  customer_id: 0,
  service_request_id: undefined,
  amount: 0,
  status: 'draft',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-800 text-slate-300 border-slate-600',
  sent: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  paid: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  overdue: 'bg-red-900/40 text-red-300 border-red-700/40',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState<InvoiceResponse | null>(null);
  const [form, setForm] = useState<InvoiceCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.invoices.list().then(setInvoices).catch(() => setInvoices([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditInvoice(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (inv: InvoiceResponse) => {
    setEditInvoice(inv);
    setForm({
      customer_id: inv.customer_id,
      service_request_id: inv.service_request_id,
      amount: inv.amount,
      status: inv.status,
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editInvoice) {
        // No PUT on invoices — delete and recreate
        await api.invoices.delete(editInvoice.id);
        const created = await api.invoices.create(form);
        setInvoices((prev) => prev.map((inv) => inv.id === editInvoice.id ? created : inv));
        setSuccess('Invoice updated successfully.');
      } else {
        const created = await api.invoices.create(form);
        setInvoices((prev) => [...prev, created]);
        setSuccess('Invoice created successfully.');
      }
      setShowForm(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.invoices.delete(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      setDeleteId(null);
      setSuccess('Invoice deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = invoices.filter((inv) =>
    String(inv.customer_id).includes(search) ||
    inv.status.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((s, inv) => s + inv.amount, 0);
  const paidAmount = filtered.filter((inv) => inv.status === 'paid').reduce((s, inv) => s + inv.amount, 0);

  return (
    <>
      <Head><title>Invoices — DataAI Solutions</title></Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Invoices</h1>
              <p className="text-slate-400 mt-1">Create and manage client invoices.</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> New Invoice
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

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Total Invoiced</p>
            <p className="text-white font-bold text-xl">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Total Paid</p>
            <p className="text-emerald-300 font-bold text-xl">${paidAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer ID or status…"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No invoices match your search.' : 'No invoices yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60">
                <tr>
                  {['Invoice #', 'Customer ID', 'Service Req ID', 'Amount', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">INV-{String(inv.id).padStart(4, '0')}</td>
                    <td className="px-5 py-4 text-slate-300">#{inv.customer_id}</td>
                    <td className="px-5 py-4 text-slate-400">{inv.service_request_id ? `#${inv.service_request_id}` : '—'}</td>
                    <td className="px-5 py-4 text-white font-bold">${inv.amount.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${STATUS_COLORS[inv.status] || ''}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(inv)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(inv.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-white font-bold text-lg">{editInvoice ? 'Edit Invoice' : 'New Invoice'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer ID *</label>
                  <input
                    required type="number" min={1}
                    value={form.customer_id || ''}
                    onChange={(e) => setForm({ ...form, customer_id: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Req ID</label>
                  <input
                    type="number" min={1}
                    value={form.service_request_id || ''}
                    onChange={(e) => setForm({ ...form, service_request_id: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

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
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving…' : editInvoice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">Delete Invoice?</h3>
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
