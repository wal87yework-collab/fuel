
export type Role = 'ADMIN' | 'STAFF';
export type CalendarType = 'gregorian' | 'hijri';
export type ExpenseType = 'FIXED' | 'VARIABLE';
export type Recurrence = 'ONCE' | 'MONTHLY' | 'YEARLY';

export interface User {
  id: string;
  pin: string;
  name: string;
  role: Role;
  username: string;
}

export interface Document {
  id: string;
  type: string;
  expiryDate: string; 
  calendarType: CalendarType;
  fileName: string;
  fileData?: string; 
}

export interface StaffMember {
  id: string;
  fullName: string;
  nationality: string;
  dob: string;
  contact: string; 
  phone: string;
  email: string;
  jobTitle: string;
  salary: number; 
  documents: Document[];
}

export interface StationDocType {
  id: string;
  label: string;
  labelAr: string;
}

export interface StationDocument {
  id: string;
  type: string;
  expiryDate: string;
  calendarType: CalendarType;
  fileName: string;
  fileData?: string;
}

export interface FuelType {
  id: string;
  name: string; 
  pricePerLiter: number;
  purchasePricePerLiter: number; 
  includesTax: boolean;
  initialStock: number;
  currentStock: number;
  evaporationAmount: number;
  alertThreshold: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  fuelTypes: string[]; 
}

export interface SupplyTransaction {
  id: string;
  supplierId: string;
  supplierName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  quantity: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  category: 'Rent' | 'Salary' | 'Electricity' | 'Water' | 'Maintenance' | 'Government' | 'Other';
  type: ExpenseType;
  recurrence: Recurrence;
  amount: number;
  date: string;
  description: string;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  pumpId: string;
  fuelType: string;
  fuelTypeId: string;
  priceAtShift: number;
  startReading: number;
  endReading?: number;
  startTime: string;
  endTime?: string;
  status: 'OPEN' | 'CLOSED';
  totalLiters?: number;
  expectedAmount?: number;
  cashAmount?: number;
  cardAmount?: number;
  shortage?: number;
}

export interface PumpMeter {
  id: string;
  pumpId: string;
  name: string;
  fuelTypeId: string;
  lastReading: number;
  currentReading: number;
  deficit: number;
}

export interface FinanceSummary {
  cashBox: number;
  bankBalance: number;
  totalVat: number;
  totalRevenue: number;
}

export interface AppSettings {
  companyName: string;
  companyNameAr: string;
  taxNumber: string;
  logo: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface BackupLog {
  id: string;
  timestamp: string;
  userName: string;
  fileName: string;
}

export type Language = 'en' | 'ar';
