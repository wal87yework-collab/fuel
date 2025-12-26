
import React, { useMemo, useState } from 'react';
import { AuditLog, AppSettings } from '../types';
import { ShieldAlert, Search, Filter, Download, History, Calendar, User as UserIcon, Info } from 'lucide-react';
import { exportToExcel } from '../utils/helpers';

interface AuditLogPageProps {
  logs: AuditLog[];
  t: any;
  isRtl: boolean;
  settings: AppSettings;
}

const AuditLogPage: React.FC<AuditLogPageProps> = ({ logs, t, isRtl, settings }) => {
  const [search, setSearch] = useState('');
  
  const filteredLogs = useMemo(() => {
    return logs.filter(l => 
      l.userName.toLowerCase().includes(search.toLowerCase()) || 
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-600 rounded-2xl text-white shadow-xl"><ShieldAlert className="w-8 h-8" /></div>
          <div>
            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-widest">{t.auditLogs}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">System-wide Transparency log</p>
          </div>
        </div>
        <button onClick={() => exportToExcel(filteredLogs, 'audit_trail', settings)} className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl transition-all shadow-sm uppercase text-xs tracking-widest">
           <Download className="w-5 h-5" /> {t.exportExcel}
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[1000px]">
             <thead className="bg-slate-50/50">
               <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                 <th className="p-8"><Calendar className="w-4 h-4 inline mr-2 opacity-50" /> {t.timestamp}</th>
                 <th className="p-8"><UserIcon className="w-4 h-4 inline mr-2 opacity-50" /> {t.user}</th>
                 <th className="p-8"><History className="w-4 h-4 inline mr-2 opacity-50" /> {t.action}</th>
                 <th className="p-8"><Info className="w-4 h-4 inline mr-2 opacity-50" /> {t.details}</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {filteredLogs.map(log => (
                 <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                   <td className="p-8">
                     <span className="text-xs font-black text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</span>
                     <p className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</p>
                   </td>
                   <td className="p-8">
                     <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700">{log.userName}</span>
                   </td>
                   <td className="p-8">
                     <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${log.action.includes('LOGIN') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{log.action}</span>
                   </td>
                   <td className="p-8">
                     <p className="text-xs font-bold text-slate-500 max-w-md">{log.details}</p>
                   </td>
                 </tr>
               ))}
               {filteredLogs.length === 0 && (
                 <tr>
                   <td colSpan={4} className="p-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Clear Log - No actions found</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
