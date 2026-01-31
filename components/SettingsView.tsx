
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Settings } from '../types';
import { Save, Store, Phone, Smartphone, Download, DollarSign } from 'lucide-react';

const SettingsView: React.FC<{ settings: Settings; onUpdate: () => void }> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState({ 
    shopName: settings.shopName, 
    shopPhone: settings.shopPhone,
    currencySymbol: settings.currencySymbol || '₹'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert('Open this app in Chrome on your Android phone and select "Install App" from the menu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await db.settings.update(settings.id!, formData);
    onUpdate();
    setIsSaving(false);
    alert('Settings updated successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border">
        <div className="flex items-center space-x-4 mb-10">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Store size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shop Settings</h2>
            <p className="text-slate-500 font-medium">Customize your billing environment.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Shop Name</label>
              <div className="relative">
                <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  type="text"
                  required
                  placeholder="The Coffee Stop"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 text-lg"
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input
                    type="text"
                    required
                    placeholder="+91 00000 00000"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                    value={formData.shopPhone}
                    onChange={e => setFormData({ ...formData, shopPhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Currency Symbol</label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input
                    type="text"
                    required
                    placeholder="₹"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                    value={formData.currencySymbol}
                    onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center space-x-3 py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-xl shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            <Save size={24} strokeWidth={3} />
            <span>{isSaving ? 'Updating...' : 'Update Settings'}</span>
          </button>
        </form>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border overflow-hidden relative">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
            <Smartphone size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Native Experience</h2>
            <p className="text-slate-500 font-medium">Install this app for offline use.</p>
          </div>
        </div>
        
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center space-x-3 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95"
        >
          <Download size={22} />
          <span>Add to Home Screen</span>
        </button>
        
        <div className="mt-8 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
          <span>Engine: ShopBill Core v2.0</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>System Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
