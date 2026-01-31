
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product, BillItem, PaymentMode, Settings, Bill } from '../types';
import { 
  Trash2, 
  Printer, 
  Download, 
  Share2, 
  Plus,
  Minus,
  CheckCircle2,
  X
} from 'lucide-react';
import { generateBillPDF } from '../utils/exportUtils';
import { format } from 'date-fns';

const BillingView: React.FC<{ settings: Settings }> = ({ settings }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [billNumber, setBillNumber] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSavedBill, setLastSavedBill] = useState<Bill | null>(null);

  const currency = settings.currencySymbol || '₹';

  useEffect(() => {
    const init = async () => {
      const p = await db.products.toArray();
      setProducts(p);
      const count = await db.bills.count();
      setBillNumber(`B${1000 + count + 1}`);
    };
    init();
  }, []);

  const handleProductTap = (product: Product) => {
    const existingIndex = items.findIndex(i => i.productId === product.id);
    if (existingIndex > -1) {
      updateQuantity(existingIndex, items[existingIndex].quantity + 1);
    } else {
      setItems([...items, { 
        productId: product.id!, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        total: product.price 
      }]);
    }
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return removeItem(index);
    const newItems = [...items];
    newItems[index].quantity = newQty;
    newItems[index].total = newItems[index].quantity * newItems[index].price;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.total, 0);

  const handleCompleteSale = async () => {
    if (items.length === 0) return;

    const bill: Bill = {
      billNumber,
      date: new Date(),
      items,
      subTotal: total,
      tax: 0,
      total,
      paymentMode
    };

    const id = await db.bills.add(bill);
    const saved = { ...bill, id: id as number };
    setLastSavedBill(saved);
    setShowSuccessModal(true);
    
    // Reset for next bill
    setItems([]);
    setPaymentMode('Cash');
    const count = await db.bills.count();
    setBillNumber(`B${1000 + count + 1}`);
  };

  const handlePrint = () => {
    if (lastSavedBill) {
      const doc = generateBillPDF(lastSavedBill, settings);
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    }
  };

  const handleDownload = () => {
    if (lastSavedBill) {
      const doc = generateBillPDF(lastSavedBill, settings);
      doc.save(`${lastSavedBill.billNumber}.pdf`);
    }
  };

  const handleWhatsApp = () => {
    if (!lastSavedBill) return;
    const itemDetails = lastSavedBill.items.map(i => `${i.name} x${i.quantity}`).join('%0A');
    const text = `*Bill: ${lastSavedBill.billNumber}*%0ATotal: ${currency}${lastSavedBill.total.toFixed(2)}%0AItems:%0A${itemDetails}%0AThank you!`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden -mt-4 -mx-4 md:-mt-10 md:-mx-10">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{settings.shopName}</h1>
          <p className="text-xs font-semibold text-slate-400">{settings.shopPhone}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">{format(new Date(), 'EEEE, dd MMM')}</p>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{billNumber}</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Product List (Vertical) */}
        <div className="w-1/2 md:w-3/5 border-r flex flex-col bg-slate-50/30">
          <div className="p-4 border-b bg-white">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-tighter">Products</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => handleProductTap(p)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
              >
                <span className="text-lg font-bold text-slate-800">{p.name}</span>
                <span className="text-lg font-black text-slate-400">{currency}{p.price.toFixed(0)}</span>
              </button>
            ))}
            {products.length === 0 && (
              <div className="p-10 text-center text-slate-400 italic">No products found. Add some in Inventory.</div>
            )}
          </div>
        </div>

        {/* Right: Bill Summary */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-tighter">Summary</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100 group">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs font-bold text-slate-400">{currency}{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-slate-50 px-2 py-1 rounded-lg">
                    <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="p-1 text-slate-400 hover:text-indigo-600"><Minus size={16} /></button>
                    <span className="w-4 text-center font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="p-1 text-slate-400 hover:text-indigo-600"><Plus size={16} /></button>
                  </div>
                  <div className="w-20 text-right font-black text-slate-900">
                    {currency}{item.total.toFixed(2)}
                  </div>
                  <button onClick={() => removeItem(idx)} className="p-1 text-slate-200 hover:text-rose-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                <p className="font-bold">Select items to start</p>
              </div>
            )}
          </div>

          {/* Checkout Controls */}
          <div className="p-6 bg-slate-50 border-t space-y-6">
            <div className="flex items-center justify-center space-x-8">
              {(['Cash', 'UPI'] as const).map(mode => (
                <label key={mode} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="payment"
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    checked={paymentMode === mode}
                    onChange={() => setPaymentMode(mode)}
                  />
                  <span className={`text-sm font-black uppercase tracking-widest ${paymentMode === mode ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {mode}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total to Pay</p>
                <p className="text-5xl font-black text-slate-900">{currency}{total.toFixed(0)}</p>
              </div>

              <button
                onClick={handleCompleteSale}
                disabled={items.length === 0}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale shadow-xl shadow-indigo-100"
              >
                Complete Bill
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setShowSuccessModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900"><X size={24} /></button>
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-1">Bill Saved</h3>
            <p className="text-slate-400 font-bold text-sm mb-8">{lastSavedBill?.billNumber} • {currency}{lastSavedBill?.total.toFixed(2)}</p>
            
            <div className="grid grid-cols-1 gap-3">
              <button onClick={handlePrint} className="w-full flex items-center justify-center space-x-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors">
                <Printer size={18} />
                <span>Print Bill</span>
              </button>
              <button onClick={handleDownload} className="w-full flex items-center justify-center space-x-2 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
                <Download size={18} />
                <span>Save PDF</span>
              </button>
              <button onClick={handleWhatsApp} className="w-full flex items-center justify-center space-x-2 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-colors">
                <Share2 size={18} />
                <span>WhatsApp</span>
              </button>
            </div>
            
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 transition-colors"
            >
              Continue Billing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
