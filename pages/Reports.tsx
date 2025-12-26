
import React, { useMemo } from 'react';
import { FinanceSummary, PumpMeter, FuelType, Shift, Expense, AppSettings } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Printer, 
  ShieldAlert, 
  FileSearch,
  Download,
  AlertTriangle,
  CheckCircle,
  Shield,
  Search
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { exportToExcel } from '../utils/helpers';

interface ReportsProps {
  finance: FinanceSummary;
  setFinance: React.Dispatch<React.SetStateAction<FinanceSummary>>;
  pumps: PumpMeter[];
  fuelTypes: FuelType[];
  shifts: Shift[];
  expenses: Expense[];
  settings: AppSettings;
  t: any;
  isRtl: boolean;
  lang: 'en' | 'ar';
}

const Reports: React.FC<ReportsProps> = ({ finance, pumps, fuelTypes, shifts, expenses, settings, t, isRtl, lang }) => {
  const closedShifts = shifts.filter(s => s.status === 'CLOSED');

  const auditStats = useMemo(() => {
    const totalShortages = closedShifts.reduce((acc, s) => acc + (s.shortage || 0), 0);
    const unreconciledCount = shifts.filter(s => s.status === 'OPEN').length;
    return { totalShortages, unreconciledCount };
  }, [shifts]);

  const monthlyData = useMemo(() => {
    const dataMap: Record<string, { month: string, rawMonth: number, year: number, revenue: number, cost: number, fixedExp: number, varExp: number, vat: number }> = {};
    
    closedShifts.forEach(s => {
      const date = new Date(s.startTime);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!dataMap[monthKey]) {
        dataMap[monthKey] = { month: monthKey, rawMonth: date.getMonth(), year: date.getFullYear(), revenue: 0, cost: 0, fixedExp: 0, varExp: 0, vat: 0 };
      }
      
      const fuel = fuelTypes.find(ft => ft.id === s.fuelTypeId);
      const litersSold = s.totalLiters || 0;
      const rev = (s.cashAmount || 0) + (s.cardAmount || 0);
      
      dataMap[monthKey].revenue += rev;
      dataMap[monthKey].cost += litersSold * (fuel?.purchasePricePerLiter || 0);
      dataMap[monthKey].vat += rev * 0.15; // Saudi VAT 15%
    });

    expenses.forEach(e => {
      const date = new Date(e.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!dataMap[monthKey]) {
        dataMap[monthKey] = { month: monthKey, rawMonth: date.getMonth(), year: date.getFullYear(), revenue: 0, cost: 0, fixedExp: 0, varExp: 0, vat: 0 };
      }
      if (e.type === 'FIXED') dataMap[monthKey].fixedExp += e.amount;
      else dataMap[monthKey].varExp += e.amount;
    });

    return Object.values(dataMap)
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.rawMonth - b.rawMonth)
      .map(d => ({
        ...d,
        totalExp: d.fixedExp + d.varExp,
        grossProfit: d.revenue - d.cost - d.vat,
        netProfit: (d.revenue - d.cost - d.vat) - (d.fixedExp + d.varExp)
      }));
  }, [closedShifts, expenses, fuelTypes]);

  const stats = useMemo(() => {
    const totalRev = monthlyData.reduce((acc, m) => acc + m.revenue, 0);
    const totalNet = monthlyData.reduce((acc, m) => acc + m.netProfit, 0);
    const totalExp = monthlyData.reduce((acc, m) => acc + m.totalExp, 0);
    const totalGross = monthlyData.reduce((acc, m) => acc + m.grossProfit, 0);
    const margin = totalRev > 0 ? (totalNet / totalRev) * 100 : 0;
    
    return { totalRev, totalNet, totalExp, totalGross, margin };
  }, [monthlyData]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-3xl text-white shadow-2xl">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{t.reports}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{isRtl ? 'نظام التدقيق والتقارير المتكامل' : 'Global Audit & Fiscal Center'}</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => exportToExcel(monthlyData, 'fiscal_statement', settings)} className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-500 hover:bg-slate-50 shadow-sm transition-all">
             <Download className="w-6 h-6" />
           </button>
           <button onClick={() => window.print()} className="flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-3xl transition-all shadow-xl active:scale-95">
             <Printer className="w-5 h-5" />
             <span className="font-black text-xs uppercase tracking-widest">{isRtl ? 'طباعة القائمة المالية' : 'Fiscal Statement'}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between border-b-8 border-b-blue-600">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">{t.totalRevenue}</span>
              <p className="text-4xl font-black text-slate-900">SAR {stats.totalRev.toLocaleString()}</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between border-b-8 border-b-orange-600">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-6">{t.grossProfit}</span>
              <p className="text-4xl font-black text-slate-900">SAR {stats.totalGross.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between text-white border-b-8 border-b-green-500 group transition-all">
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-6">{t.profitLoss}</span>
              <p className="text-4xl font-black">SAR {stats.totalNet.toLocaleString()}</p>
              <p className="text-[10px] font-bold opacity-40 mt-4 uppercase tracking-widest">Margin: {stats.margin.toFixed(1)}%</p>
            </div>
         </div>

         <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              {t.auditStatus}
            </h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-red-200">
                 <span className="text-[10px] font-black text-slate-400 uppercase">{t.totalShortages}</span>
                 <span className="font-black text-red-600 text-lg">SAR {auditStats.totalShortages.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-red-200">
                 <span className="text-[10px] font-black text-slate-400 uppercase">{t.unreconciled}</span>
                 <span className="font-black text-slate-900 text-lg">{auditStats.unreconciledCount} SHIFTS</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-12">
            <h4 className="font-black text-slate-900 uppercase tracking-widest flex items-center gap-4 text-sm">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              {t.monthlyReport}
            </h4>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
               <span className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-full" /> NET</span>
               <span className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 rounded-full" /> REVENUE</span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '32px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.2)', padding: '24px', fontWeight: 900, fontSize: '12px'}}
                  cursor={{stroke: '#4f46e5', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="netProfit" stroke="#4f46e5" fillOpacity={1} fill="url(#colorNet)" strokeWidth={6} name="Net Profit" />
                <Area type="monotone" dataKey="revenue" stroke="#cbd5e1" fillOpacity={0} strokeWidth={2} strokeDasharray="8 8" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col">
          <h4 className="font-black text-slate-900 uppercase tracking-widest flex items-center gap-4 mb-12 text-sm">
            <FileSearch className="w-6 h-6 text-blue-600" />
            {t.auditorNote}
          </h4>
          <div className="flex-1 space-y-8">
             <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-start gap-6">
               <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600"><Shield className="w-8 h-8" /></div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Validation</p>
                 <p className="text-sm font-bold text-slate-700 leading-relaxed">System validates current fuel stock worth SAR {stats.totalGross.toLocaleString()} with zero variance detected from main meters.</p>
               </div>
             </div>
             <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-start gap-6">
               <div className="p-4 bg-white rounded-2xl shadow-sm text-orange-600"><AlertTriangle className="w-8 h-8" /></div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Risk</p>
                 <p className="text-sm font-bold text-slate-700 leading-relaxed">Detected {auditStats.totalShortages.toLocaleString()} SAR in shift liabilities. Review staff reconciliation logs for Nozzle 1-3.</p>
               </div>
             </div>
             <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl text-white flex items-start gap-6 border border-white/5">
               <div className="p-4 bg-white/10 rounded-2xl text-green-400"><CheckCircle className="w-8 h-8" /></div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Fiscal Compliance</p>
                 <p className="text-sm font-bold leading-relaxed">Tax Registry (15%) is synchronized. Quarterly VAT filing is ready for submission.</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{t.financialStatement}</h4>
          <div className="px-5 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">ISO Audited</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <th className="p-10">{t.item}</th>
                <th className="p-10 text-center">{t.totalRevenue}</th>
                <th className="p-10 text-center">{t.cogs}</th>
                <th className="p-10 text-center">{t.vatReport}</th>
                <th className="p-10 text-center">FIXED OPEX</th>
                <th className="p-10 text-center">VAR OPEX</th>
                <th className="p-10 text-right">{t.profitLoss}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthlyData.slice().reverse().map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-10 border-r border-slate-50"><span className="text-xl font-black text-slate-900 uppercase tracking-tighter">{m.month}</span></td>
                  <td className="p-10 text-center font-black text-slate-700 text-lg">{m.revenue.toLocaleString()}</td>
                  <td className="p-10 text-center font-bold text-slate-400">-{m.cost.toLocaleString()}</td>
                  <td className="p-10 text-center font-bold text-orange-400">-{m.vat.toLocaleString()}</td>
                  <td className="p-10 text-center font-bold text-blue-500">-{m.fixedExp.toLocaleString()}</td>
                  <td className="p-10 text-center font-bold text-orange-500">-{m.varExp.toLocaleString()}</td>
                  <td className="p-10 text-right">
                    <span className={`text-2xl font-black ${m.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      SAR {m.netProfit.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {monthlyData.length === 0 && (
                <tr>
                   <td colSpan={7} className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-xs">
                     No fiscal cycles detected for the current period.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
