
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Expense } from '../types';
import { Plus, Trash2, Wallet, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const ExpenseView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: '', note: '', date: format(new Date(), 'yyyy-MM-dd') });

  const fetchExpenses = async () => {
    const data = await db.expenses.orderBy('date').reverse().toArray();
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expense: Expense = {
      amount: parseFloat(formData.amount),
      note: formData.note,
      date: new Date(formData.date)
    };

    await db.expenses.add(expense);
    setFormData({ amount: '', note: '', date: format(new Date(), 'yyyy-MM-dd') });
    setIsModalOpen(false);
    fetchExpenses();
  };

  const deleteExpense = async (id: number) => {
    if (window.confirm('Delete this expense?')) {
      await db.expenses.delete(id);
      fetchExpenses();
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Expenses</h2>
          <p className="text-slate-500 font-medium">Total Lifetime Expenses: ₹{totalExpenses.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium shadow-lg shadow-rose-100"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b text-slate-500 text-sm">
              <tr>
                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider">Note</th>
                <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider">Amount (₹)</th>
                <th className="text-center px-6 py-4 font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No expenses recorded yet</td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{format(new Date(e.date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{e.note}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-rose-600">₹{e.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => deleteExpense(e.id!)} className="text-slate-400 hover:text-rose-600 p-1">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Record Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="date"
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note / Description</label>
                <textarea
                  required
                  placeholder="What was this expense for?"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border text-slate-700 rounded-lg font-bold hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseView;
