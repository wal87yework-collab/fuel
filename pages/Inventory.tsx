
import React, { useState, useMemo } from 'react';
import { FuelType, SupplyTransaction, AppSettings } from '../types';
import { Fuel, Save, Trash2, AlertTriangle, History as HistoryIcon, Download, Banknote } from 'lucide-react';
import { exportToExcel } from '../utils/helpers';

interface InventoryProps {
  fuels: FuelType[];
  setFuels: React.Dispatch<React.SetStateAction<FuelType[]>>;
  supplyHistory: SupplyTransaction[];
  settings: AppSettings;
  t: any;
  isRtl: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ fuels, setFuels, supplyHistory, settings, t, isRtl }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const totalStockValue = useMemo(() => {
    return fuels.reduce((acc, f) => acc + (f.currentStock * f.purchasePricePerLiter), 0);
  }, [fuels]);

  const handleUpdate = (id: string, field: keyof FuelType, value: any) => {
    setFuels(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    if (saveStatus === 'saved') setSaveStatus('idle');
  };

  const addNewFuel = () => {
    const newItem: FuelType = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Product',
      pricePerLiter: 0,
      purchasePricePerLiter: 0,
      includesTax: true,
      initialStock: 0,
      currentStock: 0,
      evaporationAmount: 0,
      alertThreshold: 5000
    };
    setFuels(prev => [...prev, newItem]);
  };

  const handleSaveAll = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-3xl text-white shadow-2xl">
            <Fuel className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{t.inventory}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Main Tank Real-time Valuation</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-8 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-slate-100">
             <div className="p-3 bg-green-50 rounded-2xl text-green-600"><Banknote className="w-6 h-6" /></div>
             <div className="text-left">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.stockValue}</p>
               <p className="text-xl font-black text-slate-900">SAR {totalStockValue.toLocaleString()}</p>
             </div>
          </div>
          <button onClick={() => exportToExcel(fuels, 'warehouse_inventory', settings)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-6 h-6" />
          </button>
          <button onClick={handleSaveAll} className={`flex items-center gap-3 px-10 py-4 text-white font-black rounded-3xl transition-all shadow-xl active:scale-95 ${saveStatus === 'saved' ? 'bg-green-600' : 'bg-slate-900'}`}>
            <Save className="w-5 h-5" />
            <span>{saveStatus === 'saved' ? 'System Synced' : t.save}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="p-8 w-1/4">{t.item}</th>
                <th className="p-8 text-center">{t.pricePerLiter}</th>
                <th className="p-8 text-center">{t.purchasePrice}</th>
                <th className="p-8 text-center">{t.taxInclusive}</th>
                <th className="p-8 text-center bg-blue-50/20">{t.availableStock}</th>
                <th className="p-8 text-center">{t.lowStockAlert}</th>
                <th className="p-8 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fuels.map((fuel) => (
                <tr key={fuel.id} className="hover:bg-slate-50 transition-colors group focus-within:bg-blue-50/30">
                  <td className="p-0 border-r border-slate-100">
                    <input className="w-full p-8 bg-transparent outline-none font-black text-slate-900 text-lg uppercase tracking-tighter" value={fuel.name} onChange={(e) => handleUpdate(fuel.id, 'name', e.target.value)} />
                  </td>
                  <td className="p-0 border-r border-slate-100">
                    <input type="number" step="0.01" className="w-full p-8 bg-transparent outline-none text-center font-black text-blue-600 text-xl" value={fuel.pricePerLiter} onChange={(e) => handleUpdate(fuel.id, 'pricePerLiter', Number(e.target.value))} />
                  </td>
                  <td className="p-0 border-r border-slate-100">
                    <input type="number" step="0.01" className="w-full p-8 bg-transparent outline-none text-center font-bold text-slate-500 text-lg" value={fuel.purchasePricePerLiter} onChange={(e) => handleUpdate(fuel.id, 'purchasePricePerLiter', Number(e.target.value))} />
                  </td>
                  <td className="p-8 text-center">
                    <input type="checkbox" className="w-6 h-6 rounded-lg cursor-pointer accent-slate-900" checked={fuel.includesTax} onChange={(e) => handleUpdate(fuel.id, 'includesTax', e.target.checked)} />
                  </td>
                  <td className="p-8 text-center font-black text-slate-900 bg-blue-50/20 text-2xl">
                    <div className="flex items-center justify-center gap-3">
                      {fuel.currentStock.toLocaleString()} <span className="text-[10px] opacity-30">LTR</span>
                      {fuel.currentStock < fuel.alertThreshold && <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />}
                    </div>
                  </td>
                  <td className="p-0 border-r border-slate-100">
                    <input type="number" className="w-full p-8 bg-transparent outline-none text-center font-black text-red-500 text-lg" value={fuel.alertThreshold} onChange={(e) => handleUpdate(fuel.id, 'alertThreshold', Number(e.target.value))} />
                  </td>
                  <td className="p-8 text-center">
                    <button onClick={() => setFuels(p => p.filter(f => f.id !== fuel.id))} className="text-slate-200 hover:text-red-500 transition-all">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="cursor-pointer bg-slate-50/30 hover:bg-slate-100 transition-all" onClick={addNewFuel}>
                <td colSpan={7} className="p-10 text-slate-400 font-black text-center uppercase tracking-[0.3em] text-xs">
                  + Add New Inventory Channel
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><HistoryIcon className="w-6 h-6" /></div>
          <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">{t.supplyHistory}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-8">{t.supplierName}</th>
                <th className="p-8">{t.item}</th>
                <th className="p-8 text-center">{t.receiveQuantity}</th>
                <th className="p-8 text-center">{t.totalCost}</th>
                <th className="p-8 text-right">{t.handoverDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {supplyHistory.slice().reverse().map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-8 font-black text-slate-900">{tx.supplierName}</td>
                  <td className="p-8 text-slate-500 font-bold uppercase tracking-tighter text-sm">{tx.fuelTypeName}</td>
                  <td className="p-8 text-center font-black text-green-600 text-lg">+{tx.quantity.toLocaleString()} L</td>
                  <td className="p-8 text-center font-black text-slate-900 text-lg">SAR {tx.cost.toLocaleString()}</td>
                  <td className="p-8 text-right">
                    <span className="text-[10px] font-black text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 uppercase tracking-widest shadow-sm">
                      {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </span>
                  </td>
                </tr>
              ))}
              {supplyHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-xs">
                    Clear Log - No historical inbound transfers found.
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

export default Inventory;
