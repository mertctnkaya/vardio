import { getLocalDateString } from './dateUtils';

// Sadece PDF yazdırma işlemi için sekme adını geçici değiştirir
export const printDocumentAsPDF = (documentTitle: string) => {
  const originalTitle = document.title;
  document.title = documentTitle;
  window.print();
  document.title = originalTitle; 
};

// JSON İndirme Motoru
export const downloadDataAsJSON = (fileName: string, data: Record<string, any>) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// CSV İndirme Motoru (Takvim Özel)
export const downloadCalendarAsCSV = (
  fileName: string, 
  calendarDays: any[], 
  workLogs: Record<string, any>, 
  employmentStartDate: Date, 
  getShiftForDate: (date: Date) => any
) => {
  const statusMap: Record<string, string> = {
    'normal': 'Normal Mesai',
    'overtime': 'Fazla Mesai',
    'leave': 'Ücretli İzin/Rapor',
    'annual_leave': 'Yıllık İzin',
    'holiday_work': 'Resmi Tatil Mesaisi',
    'absent': 'Devamsızlık',
    'late': 'Geç Kalma',
    'partial_leave': 'Saatlik İzin'
  };

  let csvContent = "\uFEFFTarih,Vardiya,Durum,Saat (Ek/Eksik)\n";

  calendarDays.forEach(item => {
    if (!item.isCurrentMonth || item.date < employmentStartDate) return;

    const dateStr = getLocalDateString(item.date);
    const log = workLogs[dateStr];
    const shift = getShiftForDate(item.date);

    let statusStr = shift.isOffDay ? 'Hafta Tatili' : 'Normal Mesai';
    if (log && log.status) {
      statusStr = statusMap[log.status] || log.status;
    }

    const hours = log?.hours ? log.hours : '';
    csvContent += `${dateStr},${shift.name},${statusStr},${hours}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// İsimlendirme Motoru
export const generateFileName = (prefix: string, date: Date, userName?: string, extension: string = '') => {
  const monthName = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(date);
  const safeUserName = userName ? userName.replace(/\s+/g, '_') : 'Rapor';
  return `${prefix}_${monthName}_${safeUserName}${extension}`;
};