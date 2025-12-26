
import React, { useState } from 'react';
// Added AppSettings to imports
import { Supplier, FuelType, SupplyTransaction, AppSettings } from '../types';
import { Truck, Plus, Trash2, Edit, Phone, Box, X, ShoppingCart, History } from 'lucide-react';

interface SuppliersProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  fuelTypes: FuelType[];
  onReceiveSupply: (tx: SupplyTransaction) => void;
  t: any;
  isRtl: boolean;
  // Added settings property to props interface
  settings: AppSettings;
}

// Updated component to receive settings prop
const SuppliersPage: React.FC<SuppliersProps> = ({ suppliers, setSuppliers, fuelTypes, onReceiveSupply, t, isRtl, settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);
  
  // Supply transaction state
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedFuelId, setSelectedFuelId] = useState('');
  const [supplyQty, setSupplyQty] = useState(0);
  const [supplyCost, setSupplyCost] = useState(0);

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier?.id) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? (editingSupplier as Supplier) : s));
    } else {
      const newSupplier: Supplier = {
        ...editingSupplier as Supplier,
        id: Math.random().toString(36).substr(2, 9),
        fuelTypes: editingSupplier?.fuelTypes || []
      };
      setSuppliers(prev => [...prev, newSupplier]);
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleProcessSupply = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === selectedSupplierId);
    const fuel = fuelTypes.find(f => f.id === selectedFuelId);
    
    if (sup && fuel && supplyQty > 0) {
      const tx: SupplyTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        supplierId: sup.id,
        supplierName: sup.name,
        fuelTypeId: fuel.id,
        fuelTypeName: fuel.name,
        quantity: supplyQty,
        cost: supplyCost,
        date: new Date().toISOString()
      };
      onReceiveSupply(tx);
      setIsSupplyModalOpen(false);
      setSelectedSupplierId('');
      setSelectedFuelId('');
      setSupplyQty(0);
      setSupplyCost(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600 rounded-xl text-white shadow-lg shadow-amber-100">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{t.suppliers}</h3>
            <p className="text-sm text-slate-500">Procurement & Supply Partners</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSupplyModalOpen(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t.addSupply}</span>
          </button>
          <button onClick={() => { setEditingSupplier({ fuelTypes: [] }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Add Supplier Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {suppliers.map((sup) => (
          <div key={sup.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <Truck className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingSupplier(sup); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                <button onClick={() => setSuppliers(p => p.filter(s => s.id !== sup.id))} className="p-2 text-slate-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <h4 className="text-xl font-bold text-slate-900 mb-2">{sup.name}</h4>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-slate-500 flex items-center gap-2"><Box className="w-4 h-4" /> {sup.contactPerson}</p>
              <p className="text-sm text-slate-500 flex items-center gap-2 font-mono"><Phone className="w-4 h-4" /> {sup.phone}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
              {sup.fuelTypes.map(ftId => {
                const ft = fuelTypes.find(f => f.id === ftId);
                return <span key={ftId} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg uppercase">{ft?.name || ftId}</span>;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
             <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
               <h3 className="font-bold">Supplier Details</h3>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
             </div>
             <form onSubmit={handleSaveSupplier} className="p-8 space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase">Supplier Name</label>
                 <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none" value={editingSupplier?.name || ''} onChange={e => setEditingSupplier(p => ({ ...p, name: e.target.value }))} required />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase">Contact Person</label>
                 <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-none" value={editingSupplier?.contactPerson || ''} onChange={e => setEditingSupplier(p => ({ ...p, contactPerson: e.target.value }))} required />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
                 <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-none" value={editingSupplier?.phone || ''} onChange={e => setEditingSupplier(p => ({ ...p, phone: e.target.value }))} required />
               </div>
               <div className="flex gap-4 pt-6">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                 <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100">Save</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {/* Receive Supply Modal */}
      {isSupplyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
             <div className="p-8 bg-amber-600 text-white flex justify-between items-center">
               <h3 className="text-xl font-bold flex items-center gap-3"><ShoppingCart className="w-6 h-6" /> {t.addSupply}</h3>
               <button onClick={() => setIsSupplyModalOpen(false)}><X className="w-6 h-6" /></button>
             </div>
             <form onSubmit={handleProcessSupply} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.supplierName}</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    required
                  >
                    <option value="">-- {t.supplierName} --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.item}</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                    value={selectedFuelId}
                    onChange={(e) => setSelectedFuelId(e.target.value)}
                    required
                  >
                    <option value="">-- {t.item} --</option>
                    {fuelTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.receiveQuantity}</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                      value={supplyQty}
                      onChange={(e) => setSupplyQty(Number(e.target.value))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.totalCost}</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                      value={supplyCost}
                      onChange={(e) => setSupplyCost(Number(e.target.value))}
                      required 
                    />
                  </div>
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsSupplyModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all">Receive & Update Stock</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
