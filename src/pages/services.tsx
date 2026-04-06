import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import {
  Cloud, BrainCircuit, BarChart3, Cpu, Server, Shield,
  Plus, X, Loader2, CheckCircle2, AlertCircle, Trash2, ImageIcon, Upload,
} from 'lucide-react';
import { api } from '@/lib/api';

const serviceCategories = [
  {
    id: 'cloud',
    icon: Cloud,
    iconColor: 'text-sky-400',
    bg: 'from-sky-500/10 to-blue-600/10 border-sky-500/20',
    title: 'Cloud Platforms',
    subtitle: 'AWS · Azure · GCP',
    desc: 'We architect, migrate, and optimize workloads across all major cloud providers. Our certified engineers deliver cloud-native solutions that scale with your business — from infrastructure design to FinOps optimization.',
    bullets: [
      'Cloud architecture design & review',
      'Lift-and-shift & re-platforming migrations',
      'Multi-cloud and hybrid-cloud strategies',
      'Cost optimization & FinOps',
      'Kubernetes & container orchestration',
    ],
  },
  {
    id: 'ai',
    icon: BrainCircuit,
    iconColor: 'text-purple-400',
    bg: 'from-purple-500/10 to-violet-600/10 border-purple-500/20',
    title: 'AI & ML Solutions',
    subtitle: 'Databricks · Snowflake · OpenAI',
    desc: 'We design and deploy AI and machine learning systems using battle-tested platforms. From feature engineering on Databricks to LLM-powered applications, we make AI accessible and production-ready.',
    bullets: [
      'Databricks Lakehouse architecture & pipelines',
      'Snowflake data platform implementations',
      'LLM fine-tuning & RAG pipelines',
      'MLOps & model lifecycle management',
      'Real-time inference & model monitoring',
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    iconColor: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-teal-600/10 border-emerald-500/20',
    title: 'Data Analytics',
    subtitle: 'BI · Data Warehouse · ETL',
    desc: 'Turn raw data into competitive advantage with modern data platforms, real-time analytics, and self-service BI. We build the infrastructure that powers confident data-driven decisions.',
    bullets: [
      'Modern data warehouse design',
      'ETL/ELT pipelines with dbt & Airflow',
      'Real-time streaming with Kafka',
      'Self-service BI & dashboards',
      'Data governance & quality frameworks',
    ],
  },
  {
    id: 'custom',
    icon: Cpu,
    iconColor: 'text-orange-400',
    bg: 'from-orange-500/10 to-rose-600/10 border-orange-500/20',
    title: 'Custom AI Implementations',
    subtitle: 'GenAI · RAG · Vector Search',
    desc: 'Bespoke AI solutions built from the ground up for your specific use case. We combine cutting-edge research with pragmatic engineering to deliver AI that solves real business problems.',
    bullets: [
      'Retrieval-Augmented Generation (RAG)',
      'Custom LLM & embedding pipelines',
      'Vector database implementation',
      'AI-powered document processing',
      'Conversational AI & chat interfaces',
    ],
  },
  {
    id: 'migration',
    icon: Server,
    iconColor: 'text-indigo-400',
    bg: 'from-indigo-500/10 to-blue-600/10 border-indigo-500/20',
    title: 'On-Premise to Cloud',
    subtitle: 'Migration · Modernization',
    desc: 'Migrate legacy analytical workloads to modern cloud platforms with zero data loss and minimal disruption. Our proven methodology ensures business continuity throughout the transition.',
    bullets: [
      'Legacy platform assessment & roadmap',
      'Phased migration planning',
      'Data validation & reconciliation',
      'Performance tuning post-migration',
      'Team training & knowledge transfer',
    ],
  },
  {
    id: 'support',
    icon: Shield,
    iconColor: 'text-rose-400',
    bg: 'from-rose-500/10 to-pink-600/10 border-rose-500/20',
    title: 'Support & Incident Resolution',
    subtitle: '24/7 · On-shore · Off-shore',
    desc: 'Round-the-clock support with on-shore and off-shore teams ensuring your data platforms run at peak performance. Rapid incident response and proactive monitoring.',
    bullets: [
      '24/7 monitoring & alerting',
      'On-shore & off-shore support teams',
      'SLA-backed incident response',
      'Proactive performance management',
      'Root cause analysis & remediation',
    ],
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    DBName: 'postgres' as const,
    createdate: new Date().toISOString(),
    imageUrl: '',
  });

  useEffect(() => {
    api.services.list().then(setServices).catch(() => setServices([])).finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setForm({ name: '', description: '', DBName: 'postgres', createdate: '', imageUrl: '' });
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.services.create({ ...form, createdate: new Date().toISOString() });
      if (imageFile) await api.images.upload(imageFile, 'service', created.id);
      setServices((prev) => [...prev, created]);
      setSuccess('Service created successfully!');
      setShowForm(false);
      setForm({ name: '', description: '', DBName: 'postgres', createdate: '', imageUrl: '' });
      setImageFile(null);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.services.delete(id);
      setServices((prev) => prev.filter((s: any) => s.id !== id));
      setDeleteId(null);
      setSuccess('Service deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Services — DataAI Solutions</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Comprehensive data and AI consulting across the full technology stack — from cloud infrastructure to custom AI.
          </p>
        </div>
      </section>

      {/* Service sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {serviceCategories.map((svc) => (
          <div
            key={svc.id}
            id={svc.id}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-gradient-to-br ${svc.bg} border rounded-2xl p-8`}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/60 flex items-center justify-center">
                  <svc.icon className={`w-6 h-6 ${svc.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{svc.title}</h2>
                  <p className={`text-sm font-medium ${svc.iconColor}`}>{svc.subtitle}</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">{svc.desc}</p>
              <ul className="space-y-2">
                {svc.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${svc.iconColor} flex-shrink-0 mt-0.5`} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <svc.icon className={`w-32 h-32 ${svc.iconColor} opacity-10`} />
            </div>
          </div>
        ))}
      </div>

      {/* DB Services from API */}
      <section className="bg-slate-900/40 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="catalog" className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Service Catalog</h2>
              <p className="text-slate-400 text-sm mt-1">Managed service offerings from our platform</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>

          {success && (
            <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 mb-6 text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No services found in the catalog.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc: any, i: number) => (
                <div key={svc.id ?? i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 relative group">
                  <button
                    onClick={() => setDeleteId(svc.id)}
                    className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="text-white font-semibold mb-1">{svc.name}</h3>
                  <p className="text-slate-400 text-sm">{svc.description}</p>
                  {svc.DBName && (
                    <span className="inline-block mt-3 text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 rounded-full px-2.5 py-1">
                      {svc.DBName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Service Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900">
              <h3 className="text-white font-bold text-lg">Add New Service</h3>
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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Service Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-600" />
                  )}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    {imageFile ? imageFile.name : 'Click to upload image'}
                  </span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Name *</label>
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Data Migration Package"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Describe the service offering…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Database</label>
                <select
                  value={form.DBName}
                  onChange={(e) => setForm({ ...form, DBName: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="postgres">postgres</option>
                  <option value="TenantOne">TenantOne</option>
                  <option value="TenantTwo">TenantTwo</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Creating…' : 'Create Service'}
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
            <h3 className="text-white font-bold text-lg mb-2">Delete Service?</h3>
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
