
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Bill, Settings } from '../types';
import { format } from 'date-fns';
import { Search, Filter, Eye, Download, Printer } from 'lucide-react';
import { generateBillPDF } from '../utils/exportUtils';

const HistoryView: React.FC<{ settings: Settings }> = ({ settings }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      const data = await db.bills.orderBy('id').reverse().toArray();
      setBills(data);
    };
    fetchBills();
  }, []);

  const filteredBills = bills.filter(b => {
    const matchesSearch = b.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? format(new Date(b.date), 'yyyy-MM-dd') === dateFilter : true;
    return matchesSearch && matchesDate;
  });

  const handlePrint = (bill: Bill) => {
    const doc = generateBillPDF(bill, settings);
    doc.save(`${bill.billNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Billing History</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Bill number..."
              className="pl-9 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              type="date"
              className="pl-4 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b text-slate-500 text-sm">
              <tr>
                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider">Bill #</th>
                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider">Mode</th>
                <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider">Total</th>
                <th className="text-center px-6 py-4 font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No bills found</td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(bill.date), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{bill.billNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${bill.paymentMode === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                        {bill.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold">₹{bill.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button onClick={() => setSelectedBill(bill)} className="text-indigo-600 hover:text-indigo-900 p-1">
                          <Eye size={18} title="View Details" />
                        </button>
                        <button onClick={() => handlePrint(bill)} className="text-slate-600 hover:text-slate-900 p-1">
                          <Printer size={18} title="Print/Download" />
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

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-900 text-white">
              <h3 className="text-lg font-bold">Bill Details: {selectedBill.billNumber}</h3>
              <button onClick={() => setSelectedBill(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 font-medium">Date</p>
                    <p className="font-bold">{format(new Date(selectedBill.date), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Payment Mode</p>
                    <p className="font-bold">{selectedBill.paymentMode}</p>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedBill.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 font-medium">{item.name}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right font-bold">₹{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-indigo-50 font-bold">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right">Grand Total</td>
                        <td className="px-4 py-3 text-right text-indigo-700">₹{selectedBill.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex space-x-3">
              <button onClick={() => handlePrint(selectedBill)} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2">
                <Printer size={18} />
                <span>Print PDF</span>
              </button>
              <button onClick={() => setSelectedBill(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
