
import React, { useState } from 'react';
// Added AppSettings to imports
import { PumpMeter, FuelType, AppSettings } from '../types';
import { Gauge, Plus, Trash2, RefreshCcw, Save, Download, Calculator, Coins } from 'lucide-react';
import { exportToExcel } from '../utils/helpers';

interface PumpsProps {
  pumps: PumpMeter[];
  setPumps: React.Dispatch<React.SetStateAction<PumpMeter[]>>;
  fuelTypes: FuelType[];
  t: any;
  isRtl: boolean;
  // Added settings property to props interface
  settings: AppSettings;
}

// Updated component to receive settings prop
const Pumps: React.FC<PumpsProps> = ({ pumps, setPumps, fuelTypes, t, isRtl, settings }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleUpdate = (id: string, field: keyof PumpMeter, value: any) => {
    setPumps(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    if (saveStatus === 'saved') setSaveStatus('idle');
  };

  const addPump = () => {
    const newPump: PumpMeter = {
      id: Math.random().toString(36).substr(2, 9),
      pumpId: (pumps.length + 1).toString().padStart(2, '0'),
      name: `Nozzle ${pumps.length + 1}`,
      fuelTypeId: fuelTypes[0]?.id || '',
      lastReading: 0,
      currentReading: 0,
      deficit: 0
    };
    setPumps(prev => [...prev, newPump]);
  };

  const handleSaveAll = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{t.pumps}</h3>
            <p className="text-sm text-gray-500">{isRtl ? 'إدارة قراءات العدادات والمبيعات' : 'Daily meter readings & sales management'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportToExcel(pumps, 'pumps_reading_report')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={handleSaveAll} className={`flex items-center gap-2 px-6 py-2.5 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 ${saveStatus === 'saved' ? 'bg-green-500' : 'bg-indigo-600'}`}>
            <Save className="w-5 h-5" />
            <span>{saveStatus === 'saved' ? 'Saved' : t.save}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1100px] table-fixed">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 w-24 text-xs font-bold text-gray-400 uppercase text-center">{t.pumpId}</th>
              <th className={`p-4 text-xs font-bold text-gray-400 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>{t.linkedFuel}</th>
              <th className="p-4 w-40 text-xs font-bold text-gray-400 uppercase text-center">{t.lastReading}</th>
              <th className="p-4 w-40 text-xs font-bold text-gray-400 uppercase text-center">{t.currentReading}</th>
              <th className="p-4 w-40 text-xs font-bold text-gray-400 uppercase text-center bg-indigo-50/50">{t.qtySold}</th>
              <th className="p-4 w-40 text-xs font-bold text-gray-400 uppercase text-center bg-green-50/50">{t.amount}</th>
              <th className="p-4 w-32 text-xs font-bold text-gray-400 uppercase text-center">{t.deficit}</th>
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pumps.map((pump) => {
              const fuel = fuelTypes.find(f => f.id === pump.fuelTypeId);
              const qty = Math.max(0, pump.currentReading - pump.lastReading);
              const amount = qty * (fuel?.pricePerLiter || 0);

              return (
                <tr key={pump.id} className="group hover:bg-indigo-50/10 transition-colors">
                  <td className="p-0 border-r border-gray-50">
                    <input 
                      className="w-full p-4 bg-transparent text-center font-mono font-bold text-gray-900 outline-none" 
                      value={pump.pumpId} 
                      onChange={(e) => handleUpdate(pump.id, 'pumpId', e.target.value)}
                    />
                  </td>
                  <td className="p-0 border-r border-gray-50">
                    <select 
                      className={`w-full p-4 bg-transparent outline-none font-bold text-indigo-700 ${isRtl ? 'text-right' : 'text-left'}`}
                      value={pump.fuelTypeId}
                      onChange={(e) => handleUpdate(pump.id, 'fuelTypeId', e.target.value)}
                    >
                      {fuelTypes.map(f => (
                        <option key={f.id} value={f.id}>{f.name} (SAR {f.pricePerLiter}/L)</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-0 border-r border-gray-50">
                    <input 
                      type="number"
                      className="w-full p-4 bg-transparent text-center font-mono outline-none text-gray-500" 
                      value={pump.lastReading} 
                      onChange={(e) => handleUpdate(pump.id, 'lastReading', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-0 border-r border-gray-50">
                    <input 
                      type="number"
                      className="w-full p-4 bg-white/50 text-center font-mono outline-none text-indigo-600 font-bold focus:bg-white focus:ring-inset focus:ring-2 focus:ring-indigo-500" 
                      value={pump.currentReading} 
                      onChange={(e) => handleUpdate(pump.id, 'currentReading', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-4 text-center font-bold text-indigo-800 bg-indigo-50/30">
                    {qty.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-bold text-green-700 bg-green-50/30">
                    SAR {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-0 border-r border-gray-50">
                    <input 
                      type="number"
                      className="w-full p-4 bg-transparent text-center font-mono outline-none text-red-500" 
                      value={pump.deficit} 
                      onChange={(e) => handleUpdate(pump.id, 'deficit', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setPumps(prev => prev.filter(p => p.id !== pump.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr className="cursor-pointer bg-gray-50/50 hover:bg-gray-100 transition-all" onClick={addPump}>
              <td colSpan={8} className="p-4 text-indigo-600 font-bold text-sm text-center">
                + {isRtl ? 'إضافة مكينة جديدة للقائمة' : 'Add New Pump To List'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'إجمالي الاستهلاك اليومي' : 'Total Daily Consumption'}</p>
            <p className="text-2xl font-bold text-gray-900">
              {pumps.reduce((acc, p) => acc + Math.max(0, p.currentReading - p.lastReading), 0).toLocaleString()} <span className="text-sm font-medium">L</span>
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-xl text-green-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'إجمالي المبيعات' : 'Total Sales Revenue'}</p>
            <p className="text-2xl font-bold text-gray-900">
              SAR {pumps.reduce((acc, p) => {
                const f = fuelTypes.find(ft => ft.id === p.fuelTypeId);
                return acc + (Math.max(0, p.currentReading - p.lastReading) * (f?.pricePerLiter || 0));
              }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 rounded-xl text-red-600">
            <RefreshCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'إجمالي العجز' : 'Total Shortage/Deficit'}</p>
            <p className="text-2xl font-bold text-red-600">
              SAR {pumps.reduce((acc, p) => {
                const f = fuelTypes.find(ft => ft.id === p.fuelTypeId);
                return acc + (p.deficit * (f?.pricePerLiter || 0));
              }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pumps;
