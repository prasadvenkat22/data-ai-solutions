import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import {
  Package, Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertCircle, Search,
  ImageIcon, Upload, Tag,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ProductCreate, ProductResponse } from '@/types';

const emptyForm: ProductCreate = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  sku: '',
  is_active: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductResponse | null>(null);
  const [form, setForm] = useState<ProductCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api.products.list().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (p: ProductResponse) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock ?? 0,
      category: p.category || '',
      sku: p.sku || '',
      is_active: p.is_active ?? true,
    });
    setImageFile(null);
    setImagePreview(api.images.getUrl('product', p.id));
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
      if (editProduct) {
        await api.products.delete(editProduct.id);
        const created = await api.products.create(form);
        setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? created : p)));
        setSuccess('Product updated successfully.');
      } else {
        const created = await api.products.create(form);
        setProducts((prev) => [...prev, created]);
        setSuccess('Product created successfully.');
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
      await api.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
      setSuccess('Product deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Products — DataAI Solutions</title></Head>

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Products</h1>
              <p className="text-slate-400 mt-1">Manage your product catalog and inventory.</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Product
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
            placeholder="Search by name, category, or SKU…"
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'No products match your search.' : 'No products yet. Add your first product!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-colors group">
                <ProductImage id={p.id} name={p.name} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold text-sm leading-tight">{p.name}</h3>
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${p.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  </div>
                  {p.category && (
                    <span className="inline-flex items-center gap-1 text-xs text-indigo-300 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-2 py-0.5 mb-2">
                      <Tag className="w-3 h-3" /> {p.category}
                    </span>
                  )}
                  {p.description && <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">${p.price.toFixed(2)}</p>
                      <p className="text-slate-500 text-xs">Stock: {p.stock ?? 0}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {p.sku && <p className="text-slate-600 text-xs mt-2 font-mono">SKU: {p.sku}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900">
              <h3 className="text-white font-bold text-lg">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Product Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Product Name *</label>
                <input
                  required minLength={2}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Cloud Analytics Suite"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Price *</label>
                  <input
                    required type="number" min={0.01} step="0.01"
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Stock</label>
                  <input
                    type="number" min={0}
                    value={form.stock ?? ''}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <input
                    value={form.category || ''}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Software"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">SKU</label>
                  <input
                    value={form.sku || ''}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g. CAS-001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <label htmlFor="is_active" className="text-sm text-slate-300">Active (visible in catalog)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving…' : editProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">Delete Product?</h3>
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

function ProductImage({ id, name }: { id: number; name: string }) {
  const [hasImage, setHasImage] = useState(true);
  if (!hasImage) {
    return (
      <div className="w-full h-36 bg-slate-700/40 flex items-center justify-center">
        <Package className="w-10 h-10 text-slate-600" />
      </div>
    );
  }
  return (
    <img
      src={api.images.getUrl('product', id)}
      alt={name}
      className="w-full h-36 object-cover"
      onError={() => setHasImage(false)}
    />
  );
}
