
import React, { useState, useEffect } from 'react';
import { Shift, PumpMeter, FuelType, User, StaffMember, AppSettings } from '../types';
import { 
  History, 
  Play, 
  CheckCircle, 
  Clock, 
  User as UserIcon, 
  Trash2, 
  X, 
  CreditCard, 
  Wallet, 
  Calculator,
  Download,
  AlertCircle,
  BarChart2,
  Filter,
  Activity,
  ArrowRight
} from 'lucide-react';
import { exportToExcel } from '../utils/helpers';

interface ShiftsProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  pumps: PumpMeter[];
  fuelTypes: FuelType[];
  staffMembers: StaffMember[];
  currentUser: User;
  onShiftClose: (fuelId: string, quantity: number) => void;
  t: any;
  isRtl: boolean;
  settings: AppSettings;
}

const ShiftsPage: React.FC<ShiftsProps> = ({ shifts, setShifts, pumps, fuelTypes, staffMembers, currentUser, onShiftClose, t, isRtl, settings }) => {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  
  const [selectedPumpId, setSelectedPumpId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [startReading, setStartReading] = useState(0);
  
  const [activeShiftToClose, setActiveShiftToClose] = useState<Shift | null>(null);
  const [endReading, setEndReading] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);
  const [cardReceived, setCardReceived] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeShifts = shifts.filter(s => s.status === 'OPEN');

  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const diff = currentTime - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pump = pumps.find(p => p.id === selectedPumpId);
    const fuel = fuelTypes.find(f => f.id === pump?.fuelTypeId);
    
    // Find staff: check staff list or check if it's the admin
    let staff: { fullName: string, id: string } | null = null;
    if (selectedStaffId === currentUser.id) {
      staff = { fullName: currentUser.name, id: currentUser.id };
    } else {
      const found = staffMembers.find(s => s.id === selectedStaffId);
      if (found) staff = { fullName: found.fullName, id: found.id };
    }

    if (!staff || !pump || !fuel) {
      alert(isRtl ? 'يرجى التأكد من اختيار الموظف والمضخة' : 'Please select staff and pump');
      return;
    }

    // Check if staff already has an open shift
    if (activeShifts.some(s => s.staffId === staff!.id)) {
      alert(t.conflictStaff || (isRtl ? 'الموظف لديه مناوبة مفتوحة بالفعل' : 'Staff member already has an open shift'));
      return;
    }

    // Check if pump is already in use
    if (activeShifts.some(s => s.pumpId === pump.name)) {
      alert(isRtl ? 'هذه المضخة مرتبطة بمناوبة مفتوحة حالياً' : 'This pump is already assigned to an open shift');
      return;
    }

    const newShift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      staffId: staff.id,
      staffName: staff.fullName,
      pumpId: pump.name,
      fuelType: fuel.name,
      fuelTypeId: fuel.id,
      priceAtShift: fuel.pricePerLiter,
      startReading: startReading || pump.currentReading,
      startTime: new Date().toISOString(),
      status: 'OPEN'
    };
    
    setShifts(prev => [...prev, newShift]);
    setIsStartModalOpen(false);
    setSelectedPumpId('');
    setSelectedStaffId('');
    setStartReading(0);
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeShiftToClose) {
      if (endReading < activeShiftToClose.startReading) {
        alert(isRtl ? 'القراءة النهائية لا يمكن أن تكون أقل من قراءة البداية' : 'End reading cannot be less than start reading');
        return;
      }

      const consumption = endReading - activeShiftToClose.startReading;
      const expectedRevenue = consumption * activeShiftToClose.priceAtShift;
      const actualRevenue = cashReceived + cardReceived;
      const shortage = expectedRevenue - actualRevenue;

      const closedShift: Shift = {
        ...activeShiftToClose,
        endReading,
        endTime: new Date().toISOString(),
        status: 'CLOSED',
        totalLiters: consumption,
        expectedAmount: expectedRevenue,
        cashAmount: cashReceived,
        cardAmount: cardReceived,
        shortage: shortage
      };

      setShifts(prev => prev.map(s => s.id === activeShiftToClose.id ? closedShift : s));
      onShiftClose(activeShiftToClose.fuelTypeId, consumption);
      
      setIsCloseModalOpen(false);
      setActiveShiftToClose(null);
      setEndReading(0);
      setCashReceived(0);
      setCardReceived(0);
    }
  };

  const filteredClosedShifts = selectedStaffFilter === 'all' 
    ? shifts.filter(s => s.status === 'CLOSED') 
    : shifts.filter(s => s.status === 'CLOSED' && s.staffId === selectedStaffFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-[2rem] text-white shadow-2xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{t.shifts}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{isRtl ? 'مراقبة وتسوية المناوبات الحالية' : 'Live Shift Monitoring & Reconciliation'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => exportToExcel(shifts, 'shift_audits', settings)} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => setIsStartModalOpen(true)} className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-[1.5rem] transition-all shadow-xl active:scale-95">
            <Play className="w-5 h-5 fill-current" />
            <span className="font-black uppercase tracking-widest text-xs">{t.startShift}</span>
          </button>
        </div>
      </div>

      {/* Active Shifts Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{isRtl ? 'المناوبات المفتوحة الآن' : 'Live Active Handover Cycles'}</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeShifts.map((shift) => (
            <div key={shift.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all border-l-4 border-l-blue-600">
              <div className="p-8 space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg uppercase tracking-tighter leading-none">{shift.staffName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{shift.pumpId} • {shift.fuelType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-blue-600 font-mono font-black text-lg">
                      <Clock className="w-4 h-4" />
                      {getElapsedTime(shift.startTime)}
                    </div>
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Running Time</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Reading</span>
                     <p className="font-black text-slate-700">{shift.startReading.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate (SAR)</span>
                     <p className="font-black text-blue-600">{shift.priceAtShift.toFixed(2)}</p>
                   </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                   <Activity className="w-3 h-3" />
                   {isRtl ? 'بدأت في:' : 'Opened at:'} {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <button 
                onClick={() => {
                  setActiveShiftToClose(shift);
                  setEndReading(shift.startReading);
                  setIsCloseModalOpen(true);
                }}
                className="w-full bg-slate-900 hover:bg-black text-white py-6 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all"
              >
                {t.closeShift}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {activeShifts.length === 0 && (
            <div className="col-span-full bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-200">
                <Play className="w-8 h-8 fill-current" />
              </div>
              <div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">{isRtl ? 'لا توجد مناوبات مفتوحة حالياً' : 'No Active Handover Cycles Detected'}</p>
                <button onClick={() => setIsStartModalOpen(true)} className="text-blue-600 font-bold text-sm underline mt-2">Open First Shift</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Logs Section */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-100 rounded-2xl text-slate-400"><History className="w-6 h-6" /></div>
             <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t.shiftHistory}</h4>
           </div>
           <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
             <Filter className="w-4 h-4 text-slate-400 mx-2" />
             <select 
               className="bg-transparent outline-none text-xs font-black text-slate-600 min-w-[200px] py-2 uppercase tracking-widest" 
               value={selectedStaffFilter} 
               onChange={(e) => setSelectedStaffFilter(e.target.value)}
             >
               <option value="all">{isRtl ? 'عرض الكل' : 'Filter by Employee'}</option>
               {staffMembers.map(sm => <option key={sm.id} value={sm.id}>{sm.fullName}</option>)}
             </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="p-8">{t.name}</th>
                <th className="p-8">{t.pumpId}</th>
                <th className="p-8 text-center">{t.consumption}</th>
                <th className="p-8 text-center">{t.amount}</th>
                <th className="p-8 text-center">{t.shortage}</th>
                <th className="p-8 text-right">{t.handoverDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClosedShifts.slice().reverse().map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">{shift.staffName.charAt(0)}</div>
                      <p className="font-black text-slate-900 uppercase tracking-tighter">{shift.staffName}</p>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">{shift.pumpId}</span>
                  </td>
                  <td className="p-8 text-center font-black text-blue-600">{shift.totalLiters?.toLocaleString()} L</td>
                  <td className="p-8 text-center font-black text-slate-900">SAR {((shift.cashAmount || 0) + (shift.cardAmount || 0)).toLocaleString()}</td>
                  <td className="p-8 text-center">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${shift.shortage && shift.shortage > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      SAR {shift.shortage?.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(shift.endTime!).toLocaleDateString()} {new Date(shift.endTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredClosedShifts.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-32 text-center text-slate-200 font-black uppercase tracking-[0.4em] text-xs">No historical reconciliation records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Shift Modal */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
               <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                 <Play className="w-5 h-5 fill-current text-blue-400" />
                 {t.startShift}
               </h3>
               <button onClick={() => setIsStartModalOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-6 h-6" /></button>
             </div>
             <form onSubmit={handleStartShift} className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.selectEmployee}</label>
                  <select 
                    className="w-full p-5 bg-slate-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-800 uppercase text-xs tracking-widest" 
                    value={selectedStaffId} 
                    onChange={(e) => setSelectedStaffId(e.target.value)} 
                    required
                  >
                    <option value="">-- Choose Operator --</option>
                    <option value={currentUser.id}>{currentUser.name} (Admin)</option>
                    {staffMembers.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.selectPump}</label>
                  <select 
                    className="w-full p-5 bg-slate-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-800 uppercase text-xs tracking-widest" 
                    value={selectedPumpId} 
                    onChange={(e) => {
                      const pId = e.target.value;
                      setSelectedPumpId(pId);
                      const pump = pumps.find(p => p.id === pId);
                      if (pump) setStartReading(pump.currentReading);
                    }} 
                    required
                  >
                    <option value="">-- Choose Nozzle --</option>
                    {pumps.map(p => (
                      <option key={p.id} value={p.id} disabled={activeShifts.some(s => s.pumpId === p.name)}>
                        {p.name} {activeShifts.some(s => s.pumpId === p.name) ? '(OCCUPIED)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.readingStart}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full p-5 bg-slate-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-3xl text-center" 
                      value={startReading} 
                      onChange={(e) => setStartReading(Number(e.target.value))} 
                      required 
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Liters</div>
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-blue-700 hover:bg-blue-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-blue-200 active:scale-95 transition-all">
                  Authorize Handover
                </button>
             </form>
           </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {isCloseModalOpen && activeShiftToClose && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
           <div className="my-8 bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-10 bg-red-600 text-white flex justify-between items-center">
               <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                 <CheckCircle className="w-6 h-6 text-white/50" />
                 {t.closeShift}
               </h3>
               <button onClick={() => setIsCloseModalOpen(false)}><X className="w-6 h-6" /></button>
             </div>
             <form onSubmit={handleCloseShift} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-1 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.readingStart}</span>
                    <p className="font-black text-slate-700 text-lg">{activeShiftToClose.startReading.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-white border-2 border-red-100 rounded-3xl space-y-1 shadow-inner">
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{t.readingEnd}</span>
                    <input 
                      type="number" 
                      className="w-full bg-transparent outline-none font-black text-red-600 text-xl" 
                      value={endReading} 
                      onChange={(e) => setEndReading(Number(e.target.value))} 
                      required 
                      autoFocus 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.cashReceived} (SAR)</label>
                    <div className="relative">
                      <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full pl-14 p-5 bg-slate-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-red-500 font-black text-xl" 
                        value={cashReceived} 
                        onChange={(e) => setCashReceived(Number(e.target.value))} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.cardReceived} (SAR)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full pl-14 p-5 bg-slate-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-red-500 font-black text-xl" 
                        value={cardReceived} 
                        onChange={(e) => setCardReceived(Number(e.target.value))} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Expected Revenue</p>
                     <p className="font-black text-red-700">SAR {((endReading - activeShiftToClose.startReading) * activeShiftToClose.priceAtShift).toLocaleString()}</p>
                   </div>
                   <Calculator className="w-8 h-8 text-red-200" />
                </div>

                <button type="submit" className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-red-100 active:scale-95 transition-all">
                  Confirm Reconciliation
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShiftsPage;
