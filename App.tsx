
import React, { useState, useEffect } from 'react';
import { translations } from './translations';
import { User, StaffMember, StationDocument, FuelType, PumpMeter, FinanceSummary, Supplier, Shift, SupplyTransaction, Expense, Language, StationDocType, AppSettings, AuditLog, BackupLog } from './types';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/StaffManagement';
import StationManagement from './pages/StationManagement';
import Inventory from './pages/Inventory';
import UserManagement from './pages/UserManagement';
import Pumps from './pages/Pumps';
import Reports from './pages/Reports';
import SuppliersPage from './pages/Suppliers';
import ShiftsPage from './pages/Shifts';
import ExpensesPage from './pages/Expenses';
import SettingsPage from './pages/Settings';
import AuditLogPage from './pages/AuditLogPage';
import { 
  LayoutDashboard, 
  Users, 
  Fuel, 
  ShieldCheck, 
  LogOut, 
  Globe, 
  Menu, 
  UserCircle,
  Settings as SettingsIcon,
  Gauge,
  BarChart3,
  Truck,
  History,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldAlert
} from 'lucide-react';
import { createAuditEntry } from './utils/helpers';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('petrol_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('petrol_lang') as Language) || 'en';
  });
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('petrol_sidebar_collapsed') === 'true';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('petrol_settings');
    return saved ? JSON.parse(saved) : { companyName: 'Saudi Petro ERP', companyNameAr: 'نظام بترو السعودي', taxNumber: '312345678900003', logo: '' };
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('petrol_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(() => {
    const saved = localStorage.getItem('petrol_backup_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [systemUsers, setSystemUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('petrol_system_users');
    return saved ? JSON.parse(saved) : [{ id: 'admin-1', pin: '1234', name: 'System Admin', role: 'ADMIN', username: 'admin' }];
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => JSON.parse(localStorage.getItem('petrol_staff') || '[]'));
  const [stationDocs, setStationDocs] = useState<StationDocument[]>(() => JSON.parse(localStorage.getItem('petrol_docs') || '[]'));
  const [stationDocTypes, setStationDocTypes] = useState<StationDocType[]>(() => {
    const saved = localStorage.getItem('petrol_doc_types');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'dt1', label: 'Commercial Registration', labelAr: 'السجل التجاري' },
      { id: 'dt2', label: 'Municipality License', labelAr: 'رخصة البلدية' },
      { id: 'dt3', label: 'Civil Defense License', labelAr: 'رخصة الدفاع المدني' },
      { id: 'dt4', label: 'Environmental Permit', labelAr: 'تصريح البيئة' }
    ];
  });

  const [fuelTypes, setFuelTypes] = useState<FuelType[]>(() => {
    const saved = localStorage.getItem('petrol_fuels');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'f1', name: 'Octane 91', pricePerLiter: 2.18, purchasePricePerLiter: 1.85, includesTax: true, initialStock: 50000, currentStock: 42000, evaporationAmount: 0, alertThreshold: 10000 },
      { id: 'f2', name: 'Octane 95', pricePerLiter: 2.33, purchasePricePerLiter: 2.05, includesTax: true, initialStock: 30000, currentStock: 12000, evaporationAmount: 0, alertThreshold: 5000 },
      { id: 'f3', name: 'Diesel', pricePerLiter: 1.15, purchasePricePerLiter: 0.95, includesTax: true, initialStock: 100000, currentStock: 85000, evaporationAmount: 0, alertThreshold: 20000 }
    ];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('petrol_expenses') || '[]'));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => JSON.parse(localStorage.getItem('petrol_suppliers') || '[]'));
  const [pumps, setPumps] = useState<PumpMeter[]>(() => {
    const saved = localStorage.getItem('petrol_pumps');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'p1', pumpId: '01', name: 'Nozzle 1 (91)', fuelTypeId: 'f1', lastReading: 10000, currentReading: 10000, deficit: 0 },
      { id: 'p2', pumpId: '02', name: 'Nozzle 2 (95)', fuelTypeId: 'f2', lastReading: 5000, currentReading: 5000, deficit: 0 }
    ];
  });
  const [shifts, setShifts] = useState<Shift[]>(() => JSON.parse(localStorage.getItem('petrol_shifts') || '[]'));
  const [supplyTransactions, setSupplyTransactions] = useState<SupplyTransaction[]>(() => JSON.parse(localStorage.getItem('petrol_supplies_tx') || '[]'));
  const [finance, setFinance] = useState<FinanceSummary>(() => JSON.parse(localStorage.getItem('petrol_finance') || '{"cashBox":0,"bankBalance":0,"totalVat":0,"totalRevenue":0}'));

  useEffect(() => {
    localStorage.setItem('petrol_user', JSON.stringify(currentUser));
    localStorage.setItem('petrol_lang', lang);
    localStorage.setItem('petrol_settings', JSON.stringify(settings));
    localStorage.setItem('petrol_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('petrol_backup_logs', JSON.stringify(backupLogs));
    localStorage.setItem('petrol_staff', JSON.stringify(staff));
    localStorage.setItem('petrol_docs', JSON.stringify(stationDocs));
    localStorage.setItem('petrol_doc_types', JSON.stringify(stationDocTypes));
    localStorage.setItem('petrol_system_users', JSON.stringify(systemUsers));
    localStorage.setItem('petrol_fuels', JSON.stringify(fuelTypes));
    localStorage.setItem('petrol_expenses', JSON.stringify(expenses));
    localStorage.setItem('petrol_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('petrol_pumps', JSON.stringify(pumps));
    localStorage.setItem('petrol_shifts', JSON.stringify(shifts));
    localStorage.setItem('petrol_supplies_tx', JSON.stringify(supplyTransactions));
    localStorage.setItem('petrol_finance', JSON.stringify(finance));
    localStorage.setItem('petrol_sidebar_collapsed', isSidebarCollapsed.toString());
  }, [currentUser, lang, settings, auditLogs, backupLogs, staff, stationDocs, stationDocTypes, systemUsers, fuelTypes, expenses, suppliers, pumps, shifts, supplyTransactions, finance, isSidebarCollapsed]);

  const logAudit = (action: string, details: string) => {
    if (!currentUser) return;
    const entry = createAuditEntry(currentUser.id, currentUser.name, action, details);
    setAuditLogs(prev => [entry, ...prev].slice(0, 5000));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = systemUsers.find(u => u.pin === pin);
    if (foundUser) {
      setCurrentUser(foundUser);
      setPin('');
      const entry = createAuditEntry(foundUser.id, foundUser.name, 'AUTH_LOGIN', 'Successful system access');
      setAuditLogs(prev => [entry, ...prev]);
    } else {
      alert(lang === 'en' ? 'Unauthorized Access: Invalid PIN' : 'دخول غير مصرح: الرمز غير صحيح');
    }
  };

  const handleLogout = () => {
    logAudit('AUTH_LOGOUT', 'User signed out from session');
    setCurrentUser(null);
  };

  const menuItems = [
    { id: 'dashboard', label: translations[lang].dashboard, icon: LayoutDashboard },
    { id: 'inventory', label: translations[lang].inventory, icon: Fuel },
    { id: 'shifts', label: translations[lang].shifts, icon: History },
    { id: 'pumps', label: translations[lang].pumps, icon: Gauge },
    { id: 'finance', label: translations[lang].finance, icon: BarChart3 },
    { id: 'administration', label: translations[lang].administration, icon: Users },
    { id: 'station', label: translations[lang].station, icon: ShieldCheck },
    { id: 'audit', label: translations[lang].auditLogs, icon: ShieldAlert },
    { id: 'settings', label: translations[lang].settings, icon: SettingsIcon },
  ];

  const t = translations[lang];
  const isRtl = lang === 'ar';

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-slate-900 px-4 ${isRtl ? 'rtl' : ''}`}>
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800">
          <div className="bg-slate-900 p-12 text-center border-b border-slate-800">
            {settings.logo ? <img src={settings.logo} className="w-24 h-24 mx-auto mb-6 object-contain" /> : <Fuel className="w-20 h-20 text-blue-500 mx-auto mb-4" />}
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{isRtl ? settings.companyNameAr : settings.companyName}</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">{t.login}</p>
          </div>
          <form onSubmit={handleLogin} className="p-12 space-y-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Security PIN Access</label>
               <input 
                type="password" 
                maxLength={4} 
                autoFocus
                className="w-full px-4 py-5 text-center text-5xl tracking-[1em] border-2 border-slate-100 rounded-3xl bg-slate-50 font-mono focus:border-blue-500 focus:bg-white outline-none transition-all" 
                placeholder="****" 
                value={pin} 
                onChange={(e) => setPin(e.target.value)} 
                required 
               />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black transition-all uppercase tracking-widest text-sm">{t.login}</button>
            <button type="button" onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')} className="w-full text-slate-400 py-2 hover:text-blue-600 font-black text-xs uppercase tracking-widest">{lang === 'en' ? 'العربية' : 'English'}</button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const isStaff = currentUser.role === 'STAFF';
    switch (activeTab) {
      case 'dashboard': return <Dashboard staff={staff} stationDocs={stationDocs} fuelTypes={fuelTypes} t={t} isRtl={isRtl} lang={lang} />;
      case 'inventory': return <Inventory fuels={fuelTypes} setFuels={(f) => { setFuelTypes(f); logAudit('INV_STOCK_UPDATE', 'Warehouse inventory levels adjusted manually'); }} t={t} isRtl={isRtl} supplyHistory={supplyTransactions} settings={settings} />;
      case 'shifts': return <ShiftsPage shifts={shifts} setShifts={(s) => { setShifts(s); }} pumps={pumps} fuelTypes={fuelTypes} staffMembers={staff} currentUser={currentUser} t={t} isRtl={isRtl} onShiftClose={(f, q) => { setFuelTypes(prev => prev.map(fuel => fuel.id === f ? { ...fuel, currentStock: fuel.currentStock - q } : fuel)); logAudit('OPS_SHIFT_CLOSE', `Manual reconciliation for fuel ID ${f} - Quantity ${q}L deducted`); }} settings={settings} />;
      case 'pumps': return <Pumps pumps={pumps} setPumps={(p) => { setPumps(p); logAudit('OPS_PUMP_UPDATE', 'Nozzle meter configuration changed'); }} fuelTypes={fuelTypes} t={t} isRtl={isRtl} settings={settings} />;
      case 'finance': return (
        <div className="space-y-8">
           {!isStaff && <ExpensesPage expenses={expenses} setExpenses={(e) => { setExpenses(e); logAudit('FIN_LEDGER_UPDATE', 'Accounting ledger entry modified'); }} staff={staff} t={t} isRtl={isRtl} settings={settings} />}
           <Reports finance={finance} setFinance={setFinance} pumps={pumps} fuelTypes={fuelTypes} shifts={shifts} expenses={expenses} t={t} isRtl={isRtl} lang={lang} settings={settings} />
        </div>
      );
      case 'administration': return (
        <div className="space-y-8">
           {!isStaff && <UserManagement users={systemUsers} setUsers={(u) => { setSystemUsers(u); logAudit('SYS_USER_MGMT', 'System user roles or access changed'); }} t={t} isRtl={isRtl} />}
           <StaffManagement staff={staff} setStaff={(s) => { setStaff(s); logAudit('HR_STAFF_MGMT', 'Personnel records updated'); }} t={t} isRtl={isRtl} settings={settings} />
           <SuppliersPage suppliers={suppliers} setSuppliers={(s) => { setSuppliers(s); logAudit('PRO_SUPPLIER_MGMT', 'Supply partner profile updated'); }} fuelTypes={fuelTypes} onReceiveSupply={(tx) => { setFuelTypes(prev => prev.map(f => f.id === tx.fuelTypeId ? { ...f, currentStock: f.currentStock + tx.quantity } : f)); setSupplyTransactions(prev => [...prev, tx]); logAudit('PRO_SUPPLY_RECEIVE', `Received ${tx.quantity}L from ${tx.supplierName}`); }} t={t} isRtl={isRtl} settings={settings} />
        </div>
      );
      case 'station': return <StationManagement docs={stationDocs} setDocs={(d) => { setStationDocs(d); logAudit('GOV_DOC_MGMT', 'Station compliance document uploaded or removed'); }} docTypes={stationDocTypes} setDocTypes={(dt) => { setStationDocTypes(dt); logAudit('SYS_CONFIG_DOCS', 'Document classification types changed'); }} t={t} isRtl={isRtl} settings={settings} />;
      case 'audit': return <AuditLogPage logs={auditLogs} t={t} isRtl={isRtl} settings={settings} />;
      case 'settings': return <SettingsPage settings={settings} setSettings={(s) => { setSettings(s); logAudit('SYS_CONFIG_COMPANY', 'Corporate identity and tax settings modified'); }} backupLogs={backupLogs} setBackupLogs={setBackupLogs} currentUser={currentUser} t={t} isRtl={isRtl} logAudit={logAudit} />;
      default: return <Dashboard staff={staff} stationDocs={stationDocs} fuelTypes={fuelTypes} t={t} isRtl={isRtl} lang={lang} />;
    }
  };

  return (
    <div className={`min-h-screen flex bg-slate-50 ${isRtl ? 'rtl' : ''}`}>
      <aside className={`fixed inset-y-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} z-50 bg-white transition-all duration-300 transform ${isSidebarCollapsed ? 'w-20' : 'w-64'} xl:relative flex flex-col shadow-2xl xl:shadow-none`}>
        <div className={`p-6 border-b flex items-center gap-3 bg-slate-900 text-white transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          {settings.logo ? <img src={settings.logo} className="w-8 h-8 object-contain" /> : <Fuel className="w-8 h-8 text-blue-400" />}
          {!isSidebarCollapsed && <span className="font-black uppercase tracking-tighter truncate text-sm">{isRtl ? settings.companyNameAr : settings.companyName}</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-xs font-black transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'} ${isSidebarCollapsed ? 'justify-center' : ''}`} title={item.label}>
              <item.icon className="w-6 h-6 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t bg-slate-50/50 space-y-2">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center justify-center p-3 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-100">
            {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 p-3 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white border-b h-20 flex items-center justify-between px-8 shrink-0 z-40">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 text-slate-400 hover:bg-slate-100 rounded-2xl xl:hidden"><Menu /></button>
             <div>
                <h2 className="font-black text-slate-900 uppercase tracking-widest text-sm">{activeTab}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{currentUser.name} | {currentUser.role}</p>
             </div>
           </div>
           <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')} className="flex items-center gap-2 px-6 py-3 border-2 border-slate-50 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:border-slate-100 uppercase tracking-widest transition-all">
             <Globe className="w-4 h-4" /> {lang === 'en' ? 'العربية' : 'English'}
           </button>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto space-y-10">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
