
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product } from '../types';
import { Plus, Pencil, Trash2, Search, Tag } from 'lucide-react';

const ProductView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    const data = await db.products.toArray();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category || 'General'
    };

    if (editingProduct) {
      await db.products.update(editingProduct.id!, product);
    } else {
      await db.products.add(product);
    }

    setFormData({ name: '', price: '', category: '' });
    setEditingProduct(null);
    setIsModalOpen(false);
    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await db.products.delete(id);
      fetchProducts();
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, price: product.price.toString(), category: product.category || '' });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Inventory</h2>
          <p className="text-slate-500 font-medium">Manage your shop items and prices.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search items..."
              className="pl-9 pr-4 py-2.5 rounded-xl border bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setIsModalOpen(true); setEditingProduct(null); setFormData({ name: '', price: '', category: '' }); }}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b text-slate-500 text-xs font-black uppercase tracking-widest">
              <tr>
                <th className="text-left px-8 py-5">Product Name</th>
                <th className="text-left px-8 py-5">Category</th>
                <th className="text-right px-8 py-5">Price</th>
                <th className="text-center px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Tag size={40} className="mb-4 opacity-20" />
                      <p className="italic font-medium">No products found in inventory</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-900">{p.name}</td>
                    <td className="px-8 py-5 whitespace-nowrap font-medium text-slate-500">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs">{p.category || 'General'}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right font-black text-indigo-600">₹{p.price.toFixed(2)}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => deleteProduct(p.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">{editingProduct ? 'Update Product' : 'New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Milk"
                  className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Dairy"
                    className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                  Discard
                </button>
                <button type="submit" className="flex-2 py-4 px-8 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                  {editingProduct ? 'Save Changes' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductView;
