
import { AppSettings, AuditLog } from '../types';

export const calculateDaysRemaining = (expiryDate: string): number => {
  if (!expiryDate) return 0;
  const expiry = new Date(expiryDate);
  const now = new Date();
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatDate = (date: string, lang: 'en' | 'ar', calendar: 'gregorian' | 'hijri' = 'gregorian'): string => {
  if (!date) return '';
  const d = new Date(date);
  if (calendar === 'hijri') {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-islamic-uma' : 'en-US-u-ca-islamic-uma', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  }
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const exportToExcel = (data: any[], fileName: string, settings?: AppSettings) => {
  if (data.length === 0) return;
  
  let companyHeader = "";
  if (settings) {
    companyHeader = `Company: ${settings.companyName} / ${settings.companyNameAr}\n`;
    companyHeader += `VAT Number: ${settings.taxNumber}\n`;
    companyHeader += `Date: ${new Date().toLocaleString()}\n\n`;
  }

  const header = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(v => {
      if (typeof v === 'string') return `"${v.replace(/"/g, '""')}"`;
      if (v === null || v === undefined) return '""';
      return v;
    }).join(',')
  ).join('\n');
  
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + companyHeader + header + "\n" + rows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadFile = (base64: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = base64;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const openFile = (base64: string) => {
  const win = window.open();
  if (win) {
    win.document.write(`<iframe src="${base64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  }
};

export const createAuditEntry = (userId: string, userName: string, action: string, details: string): AuditLog => ({
  id: Math.random().toString(36).substr(2, 9),
  userId,
  userName,
  action,
  details,
  timestamp: new Date().toISOString()
});
