import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  Wrench, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle, Search, Pencil,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ServiceRequestCreate, ServiceRequestResponse } from '@/types';

const emptyForm: ServiceRequestCreate = {
  user_id: 0,
  customer_id: undefined,
  service_name: '',
  description: '',
  status: 'pending',
  notes: '',
  amount: undefined,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  in_progress: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  completed: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700/40',
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editReq, setEditReq] = useState<ServiceRequestResponse | null>(null);
  const [form, setForm] = useState<ServiceRequestCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.serviceRequests.list().then(setRequests).catch(() => setRequests([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditReq(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (r: ServiceRequestResponse) => {
    setEditReq(r);
    setForm({
      user_id: r.user_id,
      customer_id: r.customer_id,
      service_name: r.service_name,
      description: r.description,
      status: r.status,
      notes: r.notes || '',
      amount: r.amount,
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editReq) {
        await api.serviceRequests.updateStatus(editReq.id, form.status);
        setRequests((prev) => prev.map((r) => r.id === editReq.id ? { ...r, ...form } : r));
        setSuccess('Service request updated.');
      } else {
        const created = await api.serviceRequests.create(form);
        setRequests((prev) => [...prev, created]);
        setSuccess('Service request created.');
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
      await api.serviceRequests.delete(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
      setSuccess('Service request deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = requests.filter((r) =>
    r.service_name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Service Requests — DataAI Solutions</title></Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Service Requests</h1>
              <p className="text-slate-400 mt-1">Track and manage all service requests.</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> New Request
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

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service name or description…"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Wrench className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No requests match your search.' : 'No service requests yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60">
                <tr>
                  {['ID', 'Service', 'Description', 'Status', 'User ID', 'Customer ID', 'Amount', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 text-slate-500 text-xs">#{r.id}</td>
                    <td className="px-5 py-4 text-white font-medium">{r.service_name}</td>
                    <td className="px-5 py-4 text-slate-400 max-w-xs truncate">{r.description}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${STATUS_COLORS[r.status] || ''}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">#{r.user_id}</td>
                    <td className="px-5 py-4 text-slate-400">{r.customer_id ? `#${r.customer_id}` : '—'}</td>
                    <td className="px-5 py-4 text-slate-300">{r.amount != null ? `$${r.amount.toFixed(2)}` : '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
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
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900">
              <h3 className="text-white font-bold text-lg">{editReq ? 'Edit Request' : 'New Service Request'}</h3>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">User ID *</label>
                  <input
                    required type="number" min={1}
                    value={form.user_id || ''}
                    onChange={(e) => setForm({ ...form, user_id: parseInt(e.target.value) || 0 })}
                    placeholder="1"
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Name *</label>
                <input
                  required
                  value={form.service_name}
                  onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                  placeholder="e.g. Cloud Migration"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                <textarea
                  required rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the service request…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount ($)</label>
                  <input
                    type="number" min={0} step="0.01"
                    value={form.amount ?? ''}
                    onChange={(e) => setForm({ ...form, amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving…' : editReq ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">Delete Service Request?</h3>
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
