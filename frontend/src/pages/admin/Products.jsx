import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { Button, Spinner, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const CATEGORIES = ['Floral Bliss', 'Vanilla Dreams', 'Festive Lights', 'Ocean Breeze', 'Luxury Gold Collection'];

function ProductForm({ product, onClose }) {
  const { register, handleSubmit } = useForm({ defaultValues: product || {} });
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.images?.[0]?.url || '');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const { data } = await api.post('/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(data.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally { setUploading(false); }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (imageUrl) payload.images = [{ url: imageUrl, public_id: 'uploaded' }];
      if (product) await api.put(`/products/${product._id}`, payload);
      else await api.post('/products', payload);
      queryClient.invalidateQueries(['admin-products']);
      toast.success(product ? 'Product updated!' : 'Product created!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const fields = [
    { name: 'name', label: 'Product Name', required: true },
    { name: 'shortDescription', label: 'Short Description' },
    { name: 'price', label: 'Price (₹)', type: 'number', required: true },
    { name: 'discountPrice', label: 'Discount Price (₹)', type: 'number' },
    { name: 'stock', label: 'Stock', type: 'number', required: true },
    { name: 'weight', label: 'Weight (e.g. 200g)' },
    { name: 'burnTime', label: 'Burn Time (e.g. 40-45 hours)' },
    { name: 'scent', label: 'Scent Notes' },
    { name: 'ingredients', label: 'Ingredients (comma separated)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">

          {/* Image Upload */}
          <div className="col-span-2">
            <label className="text-sm font-medium mb-2 block">Product Image</label>
            <div className="flex gap-3 items-center">
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
              )}
              <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 cursor-pointer transition-colors ${uploading ? 'opacity-50 border-gray-300' : 'border-gray-300 dark:border-gray-600 hover:border-gold'}`}>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {uploading ? '⏳ Uploading...' : imageUrl ? '🔄 Change Image' : '📷 Upload Image'}
                </span>
              </label>
            </div>
          </div>

          {fields.map(f => (
            <div key={f.name} className={f.name === 'name' || f.name === 'shortDescription' ? 'col-span-2' : ''}>
              <label className="text-sm font-medium mb-1 block">{f.label}</label>
              <input {...register(f.name, { required: f.required })} type={f.type || 'text'}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:border-gold" />
            </div>
          ))}

          <div className="col-span-2">
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea {...register('description', { required: true })} rows={3}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:border-gold resize-none" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select {...register('category', { required: true })}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 outline-none focus:border-gold">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="accent-gold" /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('isActive')} defaultChecked className="accent-gold" /> Active
            </label>
          </div>

          <div className="col-span-2 flex gap-3 mt-2">
            <Button type="submit" loading={loading} className="flex-1">{product ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminProducts() {
  const [modal, setModal] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-products']); toast.success('Deleted!'); },
  });

  if (isLoading) return <Spinner />;

  const lowStockProducts = data?.products?.filter(p => p.stock > 0 && p.stock <= 5) || [];
  const outOfStock = data?.products?.filter(p => p.stock === 0) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">Products ({data?.total})</h1>
        <Button onClick={() => setModal('create')}><Plus size={16} className="mr-2" /> Add Product</Button>
      </div>

      {/* Low Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStock.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {outOfStock.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
              <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">⚠️ Out of Stock ({outOfStock.length})</p>
              <div className="flex flex-wrap gap-2">
                {outOfStock.map(p => (
                  <button key={p._id} onClick={() => setModal(p)}
                    className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full hover:bg-red-200 transition-colors">
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">⚡ Low Stock ({lowStockProducts.length})</p>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map(p => (
                  <button key={p._id} onClick={() => setModal(p)}
                    className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full hover:bg-amber-200 transition-colors">
                    {p.name} ({p.stock})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {data?.products?.map(p => (
              <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url} alt={p.name} loading="lazy" className="w-10 h-10 object-cover rounded-lg" />
                    <span className="font-medium line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.category}</td>
                <td className="px-4 py-3">
                  <span className="font-medium">₹{p.discountPrice > 0 ? p.discountPrice : p.price}</span>
                  {p.discountPrice && <span className="text-xs text-gray-400 line-through ml-1">₹{p.price}</span>}
                </td>
                <td className="px-4 py-3">
                  <Badge color={p.stock > 10 ? 'green' : p.stock > 0 ? 'gold' : 'red'}>{p.stock}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge color={p.isActive ? 'green' : 'red'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setModal(p)} className="p-1.5 hover:text-gold transition-colors"><Edit size={16} /></button>
                    <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p._id); }}
                      className="p-1.5 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modal && <ProductForm product={modal === 'create' ? null : modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}
