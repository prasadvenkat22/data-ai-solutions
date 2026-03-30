import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  CalendarCheck, Plus, X, Loader2, CheckCircle2, AlertCircle,
  Clock, User, Building2, Phone, Mail, MapPin, FileText, Search,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { api } from '@/lib/api';
import type { RegistrationBase } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  scheduled: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  completed: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700/40',
};

const emptyForm: RegistrationBase = {
  firstname: '',
  lastname: '',
  username: '',
  useremail: '',
  clientname: '',
  servicename: '',
  clientemail: '',
  contactphoneno: '',
  address: '',
  demodate: '',
  createdate: new Date().toISOString(),
  status: 'requested',
  notes: '',
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<RegistrationBase>(emptyForm);

  useEffect(() => {
    Promise.all([
      api.registrations.list().catch(() => []),
      api.services.list().catch(() => []),
    ]).then(([regs, svcs]) => {
      setRegistrations(regs);
      setServices(svcs);
    }).finally(() => setLoading(false));
  }, []);

  const openBook = () => {
    setForm({ ...emptyForm, createdate: new Date().toISOString() });
    setError(null);
    setShowForm(true);
    // Scroll to form
    setTimeout(() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...form,
        demodate: new Date(form.demodate).toISOString(),
        createdate: new Date().toISOString(),
      };
      const created = await api.registrations.create(payload);
      setRegistrations((prev) => [created || payload, ...prev]);
      setSuccess(true);
      setShowForm(false);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = registrations.filter(
    (r) =>
      (r.firstname + ' ' + r.lastname).toLowerCase().includes(search.toLowerCase()) ||
      (r.clientname || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.useremail || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Demo Registrations — DataAI Solutions</title></Head>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Demo Registrations</h1>
              <p className="text-slate-400 mt-1">Schedule and manage your solution demos.</p>
            </div>
            <button
              onClick={openBook}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Book a Demo CTA section */}
      <section id="book" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-700/30 rounded-2xl p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-600/30 border border-indigo-600/40 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Schedule a Free Demo</h2>
                <p className="text-indigo-300 text-sm">See our DataAI platform in action — personalized to your use case.</p>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {['30-minute live walkthrough', 'Tailored to your industry & data stack', 'Q&A with our solution architects', 'No commitment required'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={openBook}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
            >
              <CalendarCheck className="w-5 h-5" />
              Book Your Demo Now
            </button>
          </div>
        </div>
      </section>

      {/* Registrations list */}
      <section id="list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">All Registrations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registrations…"
              className="w-full sm:w-72 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 mb-6 text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Demo booked successfully! We'll reach out to confirm your session.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No registrations match your search.' : 'No demo registrations yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((r: any, i: number) => (
              <div
                key={i}
                className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {(r.firstname || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {r.firstname} {r.lastname}
                      </p>
                      <p className="text-slate-400 text-xs">@{r.username}</p>
                    </div>
                  </div>
                  {r.status && (
                    <span className={`inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 border ${STATUS_COLORS[r.status] || STATUS_COLORS.requested}`}>
                      {r.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span className="truncate">{r.clientname}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span className="truncate">{r.servicename}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span className="truncate">{r.useremail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span className="truncate">{r.contactphoneno}</span>
                  </div>
                  {r.demodate && (
                    <div className="col-span-2 flex items-center gap-2 text-indigo-300">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Demo: {new Date(r.demodate).toLocaleString()}</span>
                    </div>
                  )}
                  {r.address && (
                    <div className="col-span-2 flex items-start gap-2 text-slate-500 text-xs">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{r.address}</span>
                    </div>
                  )}
                </div>

                {r.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-slate-500 text-xs">{r.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Book Demo Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-2xl z-10">
              <h3 className="text-white font-bold text-lg">Book a Demo</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-5 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              {/* Your Info */}
              <h4 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3">Your Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {[
                  { key: 'firstname', label: 'First Name *', placeholder: 'Jane', required: true },
                  { key: 'lastname', label: 'Last Name *', placeholder: 'Smith', required: true },
                  { key: 'username', label: 'Username *', placeholder: 'janesmith', required: true },
                  { key: 'useremail', label: 'Your Email *', placeholder: 'jane@example.com', type: 'email', required: true },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                    <input
                      required={f.required}
                      type={(f as any).type || 'text'}
                      value={(form as any)[f.key] || ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                    />
                  </div>
                ))}
              </div>

              {/* Client Info */}
              <h4 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3">Client & Service Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Client/Company Name *</label>
                  <input
                    required
                    value={form.clientname}
                    onChange={(e) => setForm({ ...form, clientname: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Service of Interest *</label>
                  <select
                    required
                    value={form.servicename}
                    onChange={(e) => setForm({ ...form, servicename: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select a service…</option>
                    <option value="Cloud Platforms">Cloud Platforms (AWS/Azure/GCP)</option>
                    <option value="AI & ML Solutions">AI & ML Solutions</option>
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="Custom AI Implementation">Custom AI Implementation</option>
                    <option value="On-Premise to Cloud Migration">On-Premise to Cloud Migration</option>
                    <option value="Support & Incident Resolution">Support & Incident Resolution</option>
                    {services.map((s: any) => (
                      <option key={s.id || s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Client Email *</label>
                  <input
                    required
                    type="email"
                    value={form.clientemail}
                    onChange={(e) => setForm({ ...form, clientemail: e.target.value })}
                    placeholder="contact@acme.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Contact Phone *</label>
                  <input
                    required
                    value={form.contactphoneno}
                    onChange={(e) => setForm({ ...form, contactphoneno: e.target.value })}
                    placeholder="+1 555 000 0000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Demo Time & Location */}
              <h4 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3">Demo Schedule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Preferred Demo Date & Time *</label>
                  <DatePicker
                    selected={form.demodate ? new Date(form.demodate) : null}
                    onChange={(date: Date | null) => setForm({ ...form, demodate: date ? date.toISOString() : '' })}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    placeholderText="Select date & time…"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                    wrapperClassName="w-full"
                    calendarClassName="!bg-slate-800 !border-slate-700 !rounded-xl !shadow-2xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Address / Location *</label>
                  <input
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="City, Country or Virtual"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Additional Notes</label>
                <textarea
                  rows={3}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Tell us about your data challenges or specific areas of interest…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Booking…' : 'Book Demo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
