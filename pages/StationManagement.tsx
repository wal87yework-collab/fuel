
import React, { useState } from 'react';
// Added AppSettings to imports
import { StationDocument, CalendarType, StationDocType, AppSettings } from '../types';
import { calculateDaysRemaining, formatDate, downloadFile, openFile } from '../utils/helpers';
import { ShieldCheck, Calendar as CalendarIcon, FileText, Plus, Download, AlertCircle, X, Paperclip, Eye, Settings, Trash2, Edit } from 'lucide-react';

interface StationManagementProps {
  docs: StationDocument[];
  setDocs: React.Dispatch<React.SetStateAction<StationDocument[]>>;
  docTypes: StationDocType[];
  setDocTypes: React.Dispatch<React.SetStateAction<StationDocType[]>>;
  t: any;
  isRtl: boolean;
  // Added settings property to props interface
  settings: AppSettings;
}

// Updated component to receive settings prop
const StationManagement: React.FC<StationManagementProps> = ({ docs, setDocs, docTypes, setDocTypes, t, isRtl, settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  
  const [newDoc, setNewDoc] = useState<Partial<StationDocument>>({ type: docTypes[0]?.label || '', calendarType: 'gregorian' });
  const [selectedDoc, setSelectedDoc] = useState<StationDocument | null>(null);

  // For Type Management
  const [editingType, setEditingType] = useState<Partial<StationDocType> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDoc(prev => ({ 
          ...prev, 
          fileName: file.name, 
          fileData: reader.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDoc.expiryDate && newDoc.type) {
      const doc: StationDocument = {
        ...newDoc as StationDocument,
        id: Math.random().toString(36).substr(2, 9),
      };
      setDocs(prev => [...prev, doc]);
      setIsModalOpen(false);
      setNewDoc({ type: docTypes[0]?.label || '', calendarType: 'gregorian' });
    }
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType?.label && editingType?.labelAr) {
      if (editingType.id) {
        setDocTypes(prev => prev.map(dt => dt.id === editingType.id ? (editingType as StationDocType) : dt));
      } else {
        const nt: StationDocType = {
          ...editingType as StationDocType,
          id: Math.random().toString(36).substr(2, 9),
        };
        setDocTypes(prev => [...prev, nt]);
      }
      setEditingType(null);
    }
  };

  const triggerDocOptions = (doc: StationDocument) => {
    setSelectedDoc(doc);
    setIsOptionsModalOpen(true);
  };

  const getDocTypeLabel = (typeKey: string) => {
    const dt = docTypes.find(d => d.label === typeKey || d.id === typeKey);
    if (!dt) return typeKey;
    return isRtl ? dt.labelAr : dt.label;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{t.station}</h3>
          <p className="text-sm text-slate-500 font-medium">Compliance auditing & licensing</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsTypesModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-sm"
          >
            <Settings className="w-5 h-5" />
            <span>{t.manageTypes}</span>
          </button>
          <button 
            onClick={() => {
              setNewDoc(p => ({ ...p, type: docTypes[0]?.label || '' }));
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">{t.addDoc}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {docs.map((doc) => {
          const days = calculateDaysRemaining(doc.expiryDate);
          const isExpiring = days <= 30;
          const isCritical = days <= 7;

          return (
            <div key={doc.id} className={`bg-white rounded-[2.5rem] border-2 transition-all p-8 relative overflow-hidden group ${isCritical ? 'border-red-200' : isExpiring ? 'border-orange-200' : 'border-slate-50 shadow-sm'}`}>
              <div className="flex items-start justify-between mb-8">
                <div className={`p-5 rounded-3xl ${isCritical ? 'bg-red-50' : isExpiring ? 'bg-orange-50' : 'bg-blue-50'}`}>
                  <ShieldCheck className={`w-8 h-8 ${isCritical ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isExpiring && (
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 tracking-widest ${isCritical ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {isCritical ? 'CRITICAL' : 'RENEWAL'}
                    </div>
                  )}
                  <button onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 mb-8">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{getDocTypeLabel(doc.type)}</h4>
                <p className="text-xs text-slate-400 font-bold truncate max-w-full flex items-center gap-2">
                   <Paperclip className="w-3 h-3" /> {doc.fileName}
                </p>
                <div className="pt-2">
                   <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    {doc.calendarType}
                  </span>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-2 uppercase tracking-widest"><CalendarIcon className="w-4 h-4 opacity-40" /> {t.expiry}</span>
                  <span className="text-sm font-black text-slate-900">{formatDate(doc.expiryDate, isRtl ? 'ar' : 'en', doc.calendarType)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-2 uppercase tracking-widest"><FileText className="w-4 h-4 opacity-40" /> {t.daysLeft}</span>
                  <span className={`text-sm font-black ${isCritical ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-green-600'}`}>
                    {days} {t.daysRemaining}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => triggerDocOptions(doc)}
                  className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl text-xs transition-all shadow-xl uppercase tracking-widest"
                >
                  {t.open}
                </button>
                <button 
                  onClick={() => { if (doc.fileData) downloadFile(doc.fileData, doc.fileName); }}
                  className="p-4 bg-white text-slate-400 hover:text-blue-600 border border-slate-100 rounded-2xl transition-all shadow-sm"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Type Management Modal */}
      {isTypesModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-400" />
                {t.typeManagement}
              </h3>
              <button onClick={() => setIsTypesModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-8">
              <form onSubmit={handleSaveType} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.typeNameEn}</label>
                  <input 
                    required
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={editingType?.label || ''}
                    onChange={e => setEditingType(p => ({ ...p, label: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.typeNameAr}</label>
                  <input 
                    required
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-right"
                    value={editingType?.labelAr || ''}
                    onChange={e => setEditingType(p => ({ ...p, labelAr: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full py-4 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-800 transition-all">
                    {editingType?.id ? t.save : t.addType}
                  </button>
                </div>
              </form>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {docTypes.map(type => (
                  <div key={type.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all group">
                    <div>
                      <p className="font-black text-slate-800">{type.label}</p>
                      <p className="text-xs text-slate-400 font-bold text-right">{type.labelAr}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingType(type)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (docs.some(d => d.type === type.label)) {
                            alert(isRtl ? 'لا يمكن حذف النوع المرتبط بمستندات حالية' : 'Cannot delete type that is currently in use by documents');
                            return;
                          }
                          setDocTypes(prev => prev.filter(dt => dt.id !== type.id));
                        }} 
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-700 p-8 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-widest">{t.addDoc}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddDoc} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.selectType}</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                  value={newDoc.type}
                  onChange={(e) => setNewDoc(p => ({ ...p, type: e.target.value }))}
                  required
                >
                  <option value="">-- {t.selectType} --</option>
                  {docTypes.map(dt => (
                    <option key={dt.id} value={dt.label}>{isRtl ? dt.labelAr : dt.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.calendarType}</label>
                   <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                     <button 
                       type="button"
                       onClick={() => setNewDoc(p => ({ ...p, calendarType: 'gregorian' }))}
                       className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${newDoc.calendarType === 'gregorian' ? 'bg-white shadow text-blue-700' : 'text-slate-400'}`}
                     >
                       {t.gregorian}
                     </button>
                     <button 
                       type="button"
                       onClick={() => setNewDoc(p => ({ ...p, calendarType: 'hijri' }))}
                       className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${newDoc.calendarType === 'hijri' ? 'bg-white shadow text-blue-700' : 'text-slate-400'}`}
                     >
                       {t.hijri}
                     </button>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.expiry}</label>
                   <input 
                     type="date" 
                     required 
                     className="w-full p-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                     onChange={(e) => setNewDoc(p => ({ ...p, expiryDate: e.target.value }))}
                   />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.selectFile}</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-8 hover:border-blue-400 transition-all cursor-pointer bg-slate-50/50 text-center">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileChange}
                    required
                  />
                  <Paperclip className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-black text-slate-600 uppercase tracking-tighter">{newDoc.fileName || 'Drag & Drop File'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Max Size: 10MB</p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs tracking-widest">{t.cancel}</button>
                <button type="submit" className="flex-1 py-4 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Options Modal */}
      {isOptionsModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-8">
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-blue-600 shadow-inner">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{getDocTypeLabel(selectedDoc.type)}</h3>
                <p className="text-xs text-slate-400 font-bold mt-2 truncate px-4">{selectedDoc.fileName}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                   <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                     {selectedDoc.calendarType}
                   </span>
                   <span className="px-3 py-1 bg-blue-50 rounded-lg text-[9px] font-black text-blue-600 tracking-widest">
                     {formatDate(selectedDoc.expiryDate, 'en', selectedDoc.calendarType)}
                   </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { if (selectedDoc.fileData) openFile(selectedDoc.fileData); setIsOptionsModalOpen(false); }}
                  className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl active:scale-95"
                >
                  <Eye className="w-5 h-5" />
                  {t.open}
                </button>
                <button 
                  onClick={() => { if (selectedDoc.fileData) downloadFile(selectedDoc.fileData, selectedDoc.fileName); setIsOptionsModalOpen(false); }}
                  className="flex items-center justify-center gap-3 w-full py-5 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  {t.download}
                </button>
                <button 
                  onClick={() => setIsOptionsModalOpen(false)}
                  className="w-full py-2 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-slate-600"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationManagement;
