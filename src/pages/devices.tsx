import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import {
  Cpu, Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertCircle, Search, ImageIcon, Upload,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { DeviceCreate, DeviceResponse } from '@/types';

const emptyForm: DeviceCreate = {
  customer_id: 0,
  device_type: '',
  serial_number: '',
  model: '',
  firmware_version: '',
  status: 'active',
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editDevice, setEditDevice] = useState<DeviceResponse | null>(null);
  const [form, setForm] = useState<DeviceCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api.devices.list().then(setDevices).catch(() => setDevices([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditDevice(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (d: DeviceResponse) => {
    setEditDevice(d);
    setForm({
      customer_id: d.customer_id,
      device_type: d.device_type || '',
      serial_number: d.serial_number || '',
      model: d.model || '',
      firmware_version: d.firmware_version || '',
      status: d.status || 'active',
    });
    setImageFile(null);
    setImagePreview(api.images.getUrl('device', d.id));
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
      if (editDevice) {
        await api.devices.delete(editDevice.id);
        const created = await api.devices.create(form);
        setDevices((prev) => prev.map((d) => (d.id === editDevice.id ? created : d)));
        setSuccess('Device updated successfully.');
      } else {
        const created = await api.devices.create(form);
        setDevices((prev) => [...prev, created]);
        setSuccess('Device created successfully.');
      }
      if (imageFile) await api.images.upload(imageFile);
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
      await api.devices.delete(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setDeleteId(null);
      setSuccess('Device deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = devices.filter((d) =>
    (d.model || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.serial_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.device_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Devices — DataAI Solutions</title></Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Devices</h1>
              <p className="text-slate-400 mt-1">Manage customer devices and hardware inventory.</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Device
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
            placeholder="Search by model, serial number, or type…"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Cpu className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No devices match your search.' : 'No devices yet. Add your first device!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60">
                <tr>
                  {['Image', 'Model', 'Type', 'Serial Number', 'Firmware', 'Status', 'Customer ID', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <EntityImage entity="device" id={d.id} fallback={<Cpu className="w-5 h-5 text-indigo-400" />} />
                    </td>
                    <td className="px-5 py-4 text-white font-medium">{d.model || '—'}</td>
                    <td className="px-5 py-4 text-slate-300">{d.device_type || '—'}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">{d.serial_number || '—'}</td>
                    <td className="px-5 py-4 text-slate-400">{d.firmware_version || '—'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={d.status || 'unknown'} />
                    </td>
                    <td className="px-5 py-4 text-slate-400">#{d.customer_id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(d)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
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
              <h3 className="text-white font-bold text-lg">{editDevice ? 'Edit Device' : 'Add Device'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Device Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer ID *</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.customer_id || ''}
                  onChange={(e) => setForm({ ...form, customer_id: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {[
                { key: 'device_type', label: 'Device Type', placeholder: 'e.g. Laptop, Server, Sensor' },
                { key: 'model', label: 'Model', placeholder: 'e.g. Dell XPS 15' },
                { key: 'serial_number', label: 'Serial Number', placeholder: 'e.g. SN-123456' },
                { key: 'firmware_version', label: 'Firmware Version', placeholder: 'e.g. v2.3.1' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
                  <input
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
                  value={form.status || 'active'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving…' : editDevice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">Delete Device?</h3>
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

function EntityImage({ entity, id, fallback }: { entity: string; id: number; fallback: React.ReactNode }) {
  const [hasImage, setHasImage] = useState(true);
  if (!hasImage) {
    return (
      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
        {fallback}
      </div>
    );
  }
  return (
    <img
      src={api.images.getUrl(entity, id)}
      alt=""
      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
      onError={() => setHasImage(false)}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
    inactive: 'bg-slate-800 text-slate-400 border-slate-700',
    maintenance: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${colors[status] || colors.inactive}`}>
      {status}
    </span>
  );
}
