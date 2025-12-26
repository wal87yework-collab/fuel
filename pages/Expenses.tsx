
import React, { useState, useMemo } from 'react';
// Added AppSettings to imports
import { Expense, StaffMember, ExpenseType, Recurrence, AppSettings } from '../types';
import { Receipt, Plus, Trash2, Wallet, Zap, User as UserIcon, Calendar, Download, Save, CreditCard, Repeat, ArrowRightCircle } from 'lucide-react';
import { exportToExcel } from '../utils/helpers';

interface ExpensesProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  staff: StaffMember[];
  t: any;
  isRtl: boolean;
  // Added settings property to props interface
  settings: AppSettings;
}

// Updated component to receive settings prop
const ExpensesPage: React.FC<ExpensesProps> = ({ expenses, setExpenses, staff, t, isRtl, settings }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const stats = useMemo(() => {
    const fixed = expenses.filter(e => e.type === 'FIXED').reduce((acc, e) => acc + e.amount, 0);
    const variable = expenses.filter(e => e.type === 'VARIABLE').reduce((acc, e) => acc + e.amount, 0);
    const total = fixed + variable;
    return { fixed, variable, total };
  }, [expenses]);

  const addExpenseRow = (type: ExpenseType = 'VARIABLE') => {
    const newExp: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      category: 'Other',
      type: type,
      recurrence: 'ONCE',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    };
    setExpenses(prev => [...prev, newExp]);
  };

  const handleUpdate = (id: string, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    if (saveStatus === 'saved') setSaveStatus('idle');
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white shadow-2xl">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{t.expenses}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{isRtl ? 'إدارة المصاريف الثابتة والمتغيرة' : 'Ledger: Fixed vs Variable Management'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportToExcel(expenses, 'ledger_report', settings)} className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 shadow-sm transition-all">
            <Download className="w-6 h-6" />
          </button>
          <button onClick={handleSave} className={`flex items-center gap-3 px-8 py-3.5 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 ${saveStatus === 'saved' ? 'bg-green-500' : 'bg-slate-900'}`}>
            <Save className="w-5 h-5" />
            <span>{saveStatus === 'saved' ? 'Synchronized' : t.save}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
           <div className="flex justify-between items-start mb-6">
             <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"><Repeat className="w-6 h-6" /></div>
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t.fixedExpense}</span>
           </div>
           <p className="text-3xl font-black text-slate-900">SAR {stats.fixed.toLocaleString()}</p>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-orange-200 transition-all">
           <div className="flex justify-between items-start mb-6">
             <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all"><ArrowRightCircle className="w-6 h-6" /></div>
             <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{t.variableExpense}</span>
           </div>
           <p className="text-3xl font-black text-slate-900">SAR {stats.variable.toLocaleString()}</p>
         </div>
         <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between text-white border border-white/5">
           <div className="flex justify-between items-start mb-6">
             <div className="p-4 bg-white/10 rounded-2xl text-red-400"><CreditCard className="w-6 h-6" /></div>
             <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{t.totalExpenses}</span>
           </div>
           <p className="text-3xl font-black text-red-500">SAR {stats.total.toLocaleString()}</p>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.date}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recurrence</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.description}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.amount}</th>
                <th className="p-6 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.slice().reverse().map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-0 border-r border-slate-50">
                    <input type="date" className="w-full p-6 bg-transparent outline-none font-bold text-slate-600 text-sm" value={exp.date} onChange={e => handleUpdate(exp.id, 'date', e.target.value)} />
                  </td>
                  <td className="p-0 border-r border-slate-50">
                    <select className="w-full p-6 bg-transparent outline-none font-black text-slate-800 text-sm" value={exp.category} onChange={e => handleUpdate(exp.id, 'category', e.target.value)}>
                      <option value="Rent">{t.rent}</option>
                      <option value="Salary">{t.salary}</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Water">Water</option>
                      <option value="Maintenance">{t.maintenance}</option>
                      <option value="Government">Government / Taxes</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="p-0 border-r border-slate-50">
                    <select className={`w-full p-6 bg-transparent outline-none font-black text-sm ${exp.type === 'FIXED' ? 'text-blue-600' : 'text-orange-600'}`} value={exp.type} onChange={e => handleUpdate(exp.id, 'type', e.target.value)}>
                      <option value="FIXED">{t.fixedExpense}</option>
                      <option value="VARIABLE">{t.variableExpense}</option>
                    </select>
                  </td>
                  <td className="p-0 border-r border-slate-50">
                    <select className="w-full p-6 bg-transparent outline-none font-bold text-slate-500 text-sm" value={exp.recurrence} onChange={e => handleUpdate(exp.id, 'recurrence', e.target.value)}>
                      <option value="ONCE">{t.recurrenceOnce}</option>
                      <option value="MONTHLY">{t.recurrenceMonthly}</option>
                      <option value="YEARLY">{t.recurrenceYearly}</option>
                    </select>
                  </td>
                  <td className="p-0 border-r border-slate-50">
                    <input type="text" placeholder="Detail description..." className="w-full p-6 bg-transparent outline-none text-slate-500 placeholder:italic text-sm font-medium" value={exp.description} onChange={e => handleUpdate(exp.id, 'description', e.target.value)} />
                  </td>
                  <td className="p-0 border-r border-slate-50">
                    <input type="number" className="w-full p-6 bg-transparent outline-none text-center font-black text-red-600 text-xl" value={exp.amount} onChange={e => handleUpdate(exp.id, 'amount', Number(e.target.value))} />
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => setExpenses(prev => prev.filter(e => e.id !== exp.id))} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="cursor-pointer bg-slate-50/30 hover:bg-slate-50 transition-all" onClick={() => addExpenseRow()}>
                <td colSpan={7} className="p-8 text-center text-blue-600 font-black uppercase tracking-[0.2em] text-xs">
                  + {t.addExpense}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
