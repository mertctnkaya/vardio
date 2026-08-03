// Tarihi her zaman Türkiye/Lokal saat diliminde yyyy-aa-gg formatında döndürür.
// Gece 00:00 ile 03:00 arasındaki gün kayması bug'ını kalıcı olarak çözer.
// DÜZELTME: Tüm timezone (saat dilimi) kaymalarını engelleyen yardımcı fonksiyon
export const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


// "2026-07-28" gibi bir veriyi "Temmuz 2026" yazısına dönüştürür.
export const getFormattedMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(date);
};