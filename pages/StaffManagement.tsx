
import React, { useState } from 'react';
// Added AppSettings to imports
import { StaffMember, Document, CalendarType, AppSettings } from '../types';
import { calculateDaysRemaining, exportToExcel, downloadFile, openFile, formatDate } from '../utils/helpers';
import { Plus, Search, FileText, Download, Trash2, Edit, Calendar, Paperclip, Eye, X, Phone, Mail, Banknote } from 'lucide-react';

interface StaffManagementProps {
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  t: any;
  isRtl: boolean;
  // Added settings property to props interface
  settings: AppSettings;
}

const NATIONALITIES = [
  "Saudi Arabia", "Egypt", "Pakistan", "India", "Yemen", "Jordan", "Sudan", 
  "Syria", "Lebanon", "Philippines", "Bangladesh", "Nepal", "Sri Lanka", 
  "Indonesia", "Morocco", "Tunisia", "Palestine", "United Arab Emirates", 
  "Kuwait", "Qatar", "Oman", "Bahrain"
].sort();

// Updated component to receive settings prop
const StaffManagement: React.FC<StaffManagementProps> = ({ staff, setStaff, t, isRtl, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);

  const filteredStaff = staff.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nationality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff?.id) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? (editingStaff as StaffMember) : s));
    } else {
      const staffMember: StaffMember = {
        ...editingStaff as StaffMember,
        id: Math.random().toString(36).substr(2, 9),
        documents: [],
        salary: editingStaff?.salary || 0
      };
      setStaff(prev => [...prev, staffMember]);
    }
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 ${isRtl ? 'right-4' : 'left-4'}`} />
          <input 
            type="text" 
            placeholder={t.search} 
            className={`w-full py-3 px-12 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-medium`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToExcel(staff, 'staff_audit_report')} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest">
            <Download className="w-4 h-4" />
            {t.exportExcel}
          </button>
          <button onClick={() => { setEditingStaff({}); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl active:scale-95 font-black uppercase text-[10px] tracking-widest">
            <Plus className="w-4 h-4" />
            {t.addStaff}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.name}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.salary}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.nationality}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.jobTitle}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm shrink-0">
                        {person.fullName.charAt(0)}
                      </div>
                      <p className="font-black text-slate-900">{person.fullName}</p>
                    </div>
                  </td>
                  <td className="p-6 font-black text-indigo-600">
                    SAR {(person.salary || 0).toLocaleString()}
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-500">{person.nationality}</td>
                  <td className="p-6 text-sm font-bold text-slate-500">{person.jobTitle}</td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingStaff(person); setIsModalOpen(true); }} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => setStaff(prev => prev.filter(s => s.id !== person.id))} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-widest">{editingStaff?.id ? 'Edit Profile' : t.addStaff}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveStaff} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.name}</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={editingStaff?.fullName || ''}
                    onChange={(e) => setEditingStaff(p => ({ ...p, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.nationality}</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={editingStaff?.nationality || ''}
                    onChange={(e) => setEditingStaff(p => ({ ...p, nationality: e.target.value }))}
                  >
                    <option value="">-- Select --</option>
                    {NATIONALITIES.map(nat => <option key={nat} value={nat}>{nat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.phone}</label>
                  <input 
                    type="tel" 
                    required 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={editingStaff?.phone || ''}
                    onChange={(e) => setEditingStaff(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.salary} (SAR)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-xl text-indigo-600"
                    value={editingStaff?.salary || ''}
                    onChange={(e) => setEditingStaff(p => ({ ...p, salary: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.jobTitle}</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={editingStaff?.jobTitle || ''}
                    onChange={(e) => setEditingStaff(p => ({ ...p, jobTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={editingStaff?.dob || ''}
                    onChange={(e) => setEditingStaff(p => ({ ...p, dob: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs tracking-widest">{t.cancel}</button>
                <button type="submit" className="flex-1 py-4 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
