import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  Shield, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle, Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { RoleCreate, RoleResponse } from '@/types';

const emptyForm: RoleCreate = {
  role: 'user',
  desc: '',
};

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RoleCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.roles.list().then(setRoles).catch(() => setRoles([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.roles.create(form);
      setRoles((prev) => [...prev, created]);
      setSuccess('Role created successfully.');
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
      await api.roles.delete(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
      setSuccess('Role deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = roles.filter((r) =>
    r.role.toLowerCase().includes(search.toLowerCase()) ||
    r.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Roles — DataAI Solutions</title></Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Roles</h1>
              <p className="text-slate-400 mt-1">Manage user roles and permissions.</p>
            </div>
            <button
              onClick={() => { setForm(emptyForm); setError(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Role
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
            placeholder="Search roles…"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No roles match your search.' : 'No roles defined yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <div key={r.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/40 transition-colors group relative">
                <button
                  onClick={() => setDeleteId(r.id)}
                  className="absolute top-4 right-4 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    r.role === 'admin' ? 'bg-orange-900/40 border border-orange-700/40' : 'bg-indigo-900/40 border border-indigo-700/40'
                  }`}>
                    <Shield className={`w-5 h-5 ${r.role === 'admin' ? 'text-orange-400' : 'text-indigo-400'}`} />
                  </div>
                  <div>
                    <span className={`inline-block text-xs font-bold uppercase tracking-wider rounded-full px-2.5 py-1 border ${
                      r.role === 'admin'
                        ? 'bg-orange-900/40 text-orange-300 border-orange-700/40'
                        : 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40'
                    }`}>
                      {r.role}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{r.desc}</p>
                <p className="text-slate-600 text-xs mt-3">ID #{r.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-white font-bold text-lg">Add Role</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role Type</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                <textarea
                  required rows={3}
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="Describe the role and its permissions…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Creating…' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">Delete Role?</h3>
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
