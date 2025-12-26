
import React, { useMemo } from 'react';
import { StaffMember, StationDocument, FuelType } from '../types';
import { calculateDaysRemaining, formatDate } from '../utils/helpers';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  Fuel,
  Banknote,
  Activity,
  Receipt,
  Eye
} from 'lucide-react';

interface DashboardProps {
  staff: StaffMember[];
  stationDocs: StationDocument[];
  fuelTypes: FuelType[];
  t: any;
  isRtl: boolean;
  lang: 'en' | 'ar';
}

const Dashboard: React.FC<DashboardProps> = ({ staff, stationDocs, fuelTypes, t, isRtl, lang }) => {
  const staffDocs = useMemo(() => staff.flatMap(s => s.documents.map(d => ({ ...d, staffName: s.fullName }))), [staff]);
  
  const allDocs = useMemo(() => [
    ...staffDocs.map(d => ({ ...d, category: 'Staff' })),
    ...stationDocs.map(d => ({ ...d, category: 'Station', staffName: 'Main Station' }))
  ], [staffDocs, stationDocs]);

  const expiringSoon = useMemo(() => 
    allDocs.filter(d => calculateDaysRemaining(d.expiryDate) <= 30), 
  [allDocs]);

  const lowFuelFuels = useMemo(() => fuelTypes.filter(f => f.currentStock < f.alertThreshold), [fuelTypes]);

  const totalAssetValue = useMemo(() => {
    return fuelTypes.reduce((acc, f) => acc + (f.currentStock * f.purchasePricePerLiter), 0);
  }, [fuelTypes]);

  const stats = [
    { label: t.totalStaff, value: staff.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t.stockValue, value: `SAR ${totalAssetValue.toLocaleString()}`, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: t.expiringSoon, value: expiringSoon.length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: t.activeDocs, value: allDocs.length, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-xl hover:scale-[1.02] transition-all cursor-default group">
            <div className={`p-5 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                <Activity className="w-6 h-6 text-blue-600" />
                {isRtl ? 'مستويات الخزانات الحالية' : 'Live Tank Capacity & Monitoring'}
              </h3>
              <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">Real-time Metered</div>
            </div>
            <div className="space-y-10">
              {fuelTypes.map((fuel) => {
                const percent = (fuel.currentStock / fuel.initialStock) * 100;
                return (
                  <div key={fuel.id} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-lg font-black text-slate-900 block uppercase tracking-tighter">{fuel.name}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.availableStock}: {fuel.currentStock.toLocaleString()} L</span>
                      </div>
                      <div className={`text-right ${percent < 25 ? 'text-red-600' : 'text-slate-900'}`}>
                        <span className="text-2xl font-black tracking-tighter">{percent.toFixed(0)}%</span>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Efficiency</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-5 relative overflow-hidden shadow-inner border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${percent < 25 ? 'bg-red-500' : 'bg-blue-600'}`} 
                        style={{ width: `${percent}%` }}
                      >
                         <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                {isRtl ? 'تنبيهات الامتثال والعمليات' : 'Compliance & Operational Faults'}
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {lowFuelFuels.map((fuel) => (
                <div key={fuel.id} className="p-8 flex items-center justify-between bg-red-50/50 hover:bg-red-100/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 shadow-sm">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900 block uppercase tracking-tighter text-lg">{fuel.name} Inventory Alert</span>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60">Supply depletion detected - Order required</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-red-700 bg-red-100 px-5 py-2.5 rounded-2xl border border-red-200 uppercase tracking-widest shadow-sm">{fuel.currentStock.toLocaleString()} L</span>
                </div>
              ))}
              {expiringSoon.slice(0, 5).map((doc, idx) => (
                <div key={idx} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 shadow-sm">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900 block uppercase tracking-tighter text-lg">{doc.type} Expiring</span>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60">Registry: {doc.staffName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-orange-700 bg-orange-100 px-5 py-2.5 rounded-2xl border border-orange-200 uppercase tracking-widest shadow-sm">{calculateDaysRemaining(doc.expiryDate)} DAYS LEFT</span>
                  </div>
                </div>
              ))}
              {lowFuelFuels.length === 0 && expiringSoon.length === 0 && (
                <div className="p-32 text-center space-y-6">
                   <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-green-500 shadow-inner">
                     <CheckCircle className="w-12 h-12" />
                   </div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{t.noAlerts}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-125 transition-transform duration-1000 rotate-12">
               <ShieldCheck className="w-56 h-56" />
            </div>
            <div className="relative z-10 space-y-8">
              <div>
                <h4 className="text-2xl font-black mb-1 uppercase tracking-tighter">{isRtl ? 'حالة التدقيق المالي' : 'Audit Integrity'}</h4>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">STATUS: SYSTEM SECURED</p>
              </div>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                   <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">VAT Compliance</span>
                   <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] flex items-center gap-2">VERIFIED</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                   <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Meter Integrity</span>
                   <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">0.02% VAR</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                   <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Data Audit</span>
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">PROTECTED</span>
                 </div>
              </div>
              
              <div className="pt-10 border-t border-white/10 space-y-4">
                <p className="text-[10px] font-black text-blue-400 opacity-40 uppercase tracking-[0.3em]">Total Asset Value</p>
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-white/10 rounded-2xl text-green-400 shadow-inner">
                     <TrendingUp className="w-8 h-8" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Growth Forecast</p>
                     <p className="text-xl font-black text-white">+5.2% Quarterly</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
             <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
               <Eye className="w-4 h-4 text-blue-600" /> Quick Ledger Access
             </h4>
             <button className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl">
               <Receipt className="w-4 h-4" />
               Audit Ledger Entry
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
