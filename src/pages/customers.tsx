import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  Building2, Plus, Pencil, Trash2, X, Loader2,
  CheckCircle2, AlertCircle, Search, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { CustomerCreate, CustomerResponse } from '@/types';

const emptyForm: CustomerCreate = {
  name: '',
  status: 'active',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  billing_address: '',
  tenant_id: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<CustomerResponse | null>(null);
  const [form, setForm] = useState<CustomerCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadCustomers = () => {
    setLoading(true);
    api.customers.list().then(setCustomers).catch(() => setCustomers([])).finally(() => setLoading(false));
  };

  useEffect(() => { loadCustomers(); }, []);

  const openAdd = () => { setEditCustomer(null); setForm(emptyForm); setError(null); setShowForm(true); };
  const openEdit = (c: CustomerResponse) => { setEditCustomer(c); setForm({ name: c.name, status: c.status, contact_name: c.contact_name || '', contact_email: c.contact_email || '', contact_phone: c.contact_phone || '', billing_address: c.billing_address || '', tenant_id: c.tenant_id || '' }); setError(null); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editCustomer) {
        const updated = await api.customers.update(editCustomer.id, form);
        setCustomers((prev) => prev.map((c) => (c.id === editCustomer.id ? updated : c)));
        setSuccess('Customer updated successfully.');
      } else {
        const created = await api.customers.create(form);
        setCustomers((prev) => [...prev, created]);
        setSuccess('Customer created successfully.');
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
      await api.customers.delete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
      setSuccess('Customer deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Customers — DataAI Solutions</title></Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Customers</h1>
              <p className="text-slate-400 mt-1">Manage your client accounts and contacts.</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feedback banners */}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 mb-6 text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or email…"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No customers match your search.' : 'No customers yet. Add your first customer!'}</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60">
                <tr>
                  {['Name', 'Status', 'Contact', 'Email', 'Phone', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-900/50 border border-indigo-700/30 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{c.name}</p>
                          {c.tenant_id && <p className="text-slate-500 text-xs">Tenant: {c.tenant_id}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.status === 'active'
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{c.contact_name || '—'}</td>
                    <td className="px-5 py-4 text-slate-400">{c.contact_email || '—'}</td>
                    <td className="px-5 py-4 text-slate-400">{c.contact_phone || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                        >
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
              <h3 className="text-white font-bold text-lg">
                {editCustomer ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              {[
                { key: 'name', label: 'Company Name *', placeholder: 'Acme Corp', required: true },
                { key: 'contact_name', label: 'Contact Name', placeholder: 'Jane Smith' },
                { key: 'contact_email', label: 'Contact Email', placeholder: 'jane@acme.com', type: 'email' },
                { key: 'contact_phone', label: 'Contact Phone', placeholder: '+1 555 000 0000' },
                { key: 'billing_address', label: 'Billing Address', placeholder: '123 Main St, City' },
                { key: 'tenant_id', label: 'Tenant ID', placeholder: 'tenant-uuid' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
                  <input
                    type={(field as any).type || 'text'}
                    required={field.required}
                    value={(form as any)[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving…' : editCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">Delete Customer?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. The customer will be permanently removed.</p>
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
