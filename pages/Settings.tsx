
import React, { useState } from 'react';
import { AppSettings, BackupLog, User } from '../types';
import { Settings as SettingsIcon, Save, Database, History, Upload, Download, Building2, ShieldCheck, X } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  backupLogs: BackupLog[];
  setBackupLogs: React.Dispatch<React.SetStateAction<BackupLog[]>>;
  currentUser: User;
  t: any;
  isRtl: boolean;
  logAudit: (action: string, details: string) => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ settings, setSettings, backupLogs, setBackupLogs, currentUser, t, isRtl, logAudit }) => {
  const [saveStatus, setSaveStatus] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSettings(prev => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaveStatus(true);
    logAudit('UPDATE_SETTINGS', 'Company profile and VAT number updated');
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const createBackup = () => {
    const allData = {
      settings: localStorage.getItem('petrol_settings'),
      staff: localStorage.getItem('petrol_staff'),
      docs: localStorage.getItem('petrol_docs'),
      fuels: localStorage.getItem('petrol_fuels'),
      expenses: localStorage.getItem('petrol_expenses'),
      suppliers: localStorage.getItem('petrol_suppliers'),
      pumps: localStorage.getItem('petrol_pumps'),
      shifts: localStorage.getItem('petrol_shifts'),
      users: localStorage.getItem('petrol_system_users'),
      audit: localStorage.getItem('petrol_audit_logs')
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData));
    const fileName = `backup_${new Date().toISOString().slice(0, 10)}.json`;
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", fileName);
    link.click();

    const log: BackupLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      fileName: fileName
    };
    setBackupLogs(prev => [log, ...prev]);
    logAudit('CREATE_BACKUP', `System backup created: ${fileName}`);
  };

  const restoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          Object.entries(data).forEach(([key, val]) => {
            if (val) localStorage.setItem(`petrol_${key === 'users' ? 'system_users' : key}`, val as string);
          });
          alert(isRtl ? 'تم استعادة البيانات بنجاح. سيتم إعادة تحميل الصفحة.' : 'Data restored successfully. Reloading page...');
          logAudit('RESTORE_DATA', 'Database state restored from backup file');
          window.location.reload();
        } catch (err) {
          alert('Error restoring data.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl"><SettingsIcon className="w-8 h-8" /></div>
        <div>
          <h3 className="text-3xl font-black text-slate-800 uppercase tracking-widest">{t.settings}</h3>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Global Station Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
          <h4 className="text-xl font-black text-slate-900 flex items-center gap-3"><Building2 className="w-6 h-6 text-blue-600" /> {isRtl ? 'ملف المنشأة' : 'Company Profile'}</h4>
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.companyName}</label>
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-2 focus:ring-blue-500" value={settings.companyName} onChange={e => setSettings(p => ({ ...p, companyName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.companyNameAr}</label>
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-2 focus:ring-blue-500 text-right" value={settings.companyNameAr} onChange={e => setSettings(p => ({ ...p, companyNameAr: e.target.value }))} />
                </div>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.taxNumber}</label>
               <input className="w-full p-4 bg-slate-50 rounded-2xl font-black text-lg text-slate-700 outline-none border-none focus:ring-2 focus:ring-blue-500" value={settings.taxNumber} onChange={e => setSettings(p => ({ ...p, taxNumber: e.target.value }))} />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.logo}</label>
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                   {settings.logo ? <img src={settings.logo} className="w-20 h-20 object-contain bg-white p-2 rounded-xl shadow-sm" /> : <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300"><Building2 /></div>}
                   <div className="flex-1 space-y-2">
                      <input type="file" id="logo-up" className="hidden" onChange={handleLogoUpload} />
                      <label htmlFor="logo-up" className="inline-block px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black cursor-pointer hover:bg-slate-100 uppercase tracking-widest">Select Image</label>
                      <p className="text-[10px] text-slate-400 font-bold">PNG or JPG, max 2MB</p>
                   </div>
                </div>
             </div>
             <button onClick={handleSave} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${saveStatus ? 'bg-green-500 text-white' : 'bg-slate-900 text-white shadow-xl hover:bg-black'}`}>
               {saveStatus ? <ShieldCheck className="w-5 h-5" /> : <Save className="w-5 h-5" />}
               {saveStatus ? 'Settings Applied' : t.saveSettings}
             </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
             <h4 className="text-xl font-black text-slate-900 flex items-center gap-3"><Database className="w-6 h-6 text-amber-600" /> {isRtl ? 'قاعدة البيانات والنسخ' : 'Storage & Reliability'}</h4>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={createBackup} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-3 hover:bg-amber-50 transition-all group">
                   <Download className="w-8 h-8 text-amber-600 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t.backup}</span>
                </button>
                <label className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-3 hover:bg-blue-50 transition-all group cursor-pointer">
                   <Upload className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t.restore}</span>
                   <input type="file" className="hidden" accept=".json" onChange={restoreData} />
                </label>
             </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><History className="w-4 h-4" /> {t.backupHistory}</h4>
             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {backupLogs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group">
                    <div>
                      <p className="text-xs font-black text-slate-900">{log.fileName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.userName}</span>
                  </div>
                ))}
                {backupLogs.length === 0 && <p className="text-center text-[10px] font-bold text-slate-300 py-10 uppercase tracking-widest">No previous backups</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
