import Head from 'next/head';
import RequireAuth from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import {
  Users, UserPlus, X, Loader2, CheckCircle2, AlertCircle, Search,
  Mail, Calendar, Shield, Trash2, KeyRound, Copy, Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth';
import type { UserResponse } from '@/types';

type TempPassword = { id: number; email: string; temporary_password: string; note: string };

function UsersPageInner() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  // Admin password reset: confirm, then the temporary password, shown once.
  const [resetTarget, setResetTarget] = useState<UserResponse | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [tempPassword, setTempPassword] = useState<TempPassword | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.users.list().then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.users.register(form);
      setUsers((prev) => [...prev, created]);
      setSuccess('User registered successfully!');
      setShowForm(false);
      setForm({ name: '', email: '', password: '' });
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.users.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteId(null);
      setSuccess('User deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    if (!resetTarget) return;
    setResetBusy(true);
    setError(null);
    try {
      const result = await api.users.resetPassword(resetTarget.id);
      setTempPassword(result);
      setCopied(false);
      setResetTarget(null);
    } catch (err: any) {
      setError(err.message);
      setResetTarget(null);
    } finally {
      setResetBusy(false);
    }
  };

  const copyTemp = async () => {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword.temporary_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (http, or permission denied): the value is on screen to select */
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Users</h1>
              <p className="text-slate-400 mt-1">Manage platform user accounts and registrations.</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setError(null); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Register User
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
        {error && !showForm && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-6 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email…"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No users match your search.' : 'No users registered yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{u.name}</p>
                      <p className="text-slate-500 text-xs">ID #{u.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => setResetTarget(u)}
                      title="Reset password (issue a temporary one)"
                      aria-label={`Reset password for ${u.email}`}
                      className="p-1.5 text-slate-500 hover:text-amber-300 hover:bg-amber-900/30 rounded-lg transition-colors"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(u.id)}
                      title="Delete user"
                      aria-label={`Delete ${u.email}`}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.created_date && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(u.created_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <span className="inline-flex items-center gap-1 text-xs text-indigo-300 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-2.5 py-1">
                    <Shield className="w-3 h-3" /> User
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register User Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-white font-bold text-lg">Register New User</h3>
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
                <input
                  required
                  minLength={3}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
                <input
                  required
                  type="password"
                  minLength={MIN_PASSWORD_LENGTH}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={`Min. ${MIN_PASSWORD_LENGTH} characters`}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Registering…' : 'Register'}
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
            <h3 className="text-white font-bold text-lg mb-2">Delete User?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Confirm */}
      {resetTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-700/50 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-white font-bold text-lg">Reset password?</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">
              This replaces the password for <span className="text-white">{resetTarget.email}</span> with a
              random temporary one, shown to you once. Their current password stops working immediately.
            </p>
            <p className="text-slate-500 text-xs mb-6">
              For someone who can receive email, the self-service “Forgot password?” link on the sign-in page
              is better: nobody but them ever sees the new password. Use this when that cannot work.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setResetTarget(null)}
                disabled={resetBusy}
                className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetBusy}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resetBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                {resetBusy ? 'Resetting…' : 'Reset password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary password: shown once, never retrievable again */}
      {tempPassword !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-white font-bold text-lg">Temporary password</h3>
              <button onClick={() => setTempPassword(null)} className="text-slate-400 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-slate-300 text-sm">
                For <span className="text-white">{tempPassword.email}</span>. Only the hash is stored, so this
                is the only time it can be seen. Close this and it is gone; run the reset again if needed.
              </p>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3">
                <code className="flex-1 text-emerald-300 font-mono text-base break-all select-all">
                  {tempPassword.temporary_password}
                </code>
                <button
                  onClick={copyTemp}
                  title="Copy"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-500 text-xs">{tempPassword.note}</p>
              <button
                onClick={() => setTempPassword(null)}
                className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold"
              >
                Done, I have passed it on
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Admin only. The API already refuses everyone else (every /CRUD route needs
// the admin role); this keeps a regular user from landing on a page of 403s.
export default function UsersPage() {
  return (
    <>
      <Head><title>Users — Data AI Systems</title></Head>
      <RequireAuth roles={['admin']}>
        <UsersPageInner />
      </RequireAuth>
    </>
  );
}
