import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { fetchMonthWorkLogs } from '../../services/dbService';
import { generatePayrollData } from '../../core/payrollEngine';
import { printDocumentAsPDF, downloadDataAsJSON, generateFileName } from '../../utils/exportUtils';
import ExportPanel from '../shared/ExportPanel';
import type { LegacyPayrollData } from '../../types';

export default function PayrollTab() {
  const { settings, user } = useAppStore();
  
  const [payrollDate, setPayrollDate] = useState(new Date());
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false);
  const [fetchedLogs, setFetchedLogs] = useState<any[]>([]);

  const [besDeduction, setBesDeduction] = useState('0');
  const [otherDeductions, setOtherDeductions] = useState('0');

  const [payrollData, setPayrollData] = useState<LegacyPayrollData>({
    baseGrossInfo: { daily: 0, hourly: 0 },
    incomes: { baseMonth: 0, overtime: 0, nightBonus: 0, holidayWork: 0, totalGrossHakedis: 0, extra: 0, extraSgkExempt: false }, // <-- DÜZELTİLDİ
    deductionsGross: { absent: 0, late: 0 },
    newGrossMatrah: 0,
    taxes: { sgk: 0, unemployment: 0, incomeTax: 0, stampTax: 0 },
    netMaaş: 0,
    netKesintiler: { bes: 0, other: 0, total: 0 },
    hesabaYatanNet: 0,
    calculatedNightHours: 0,
    // activeDays ve passedDays çöp kodları SİLİNDİ:
    stats: { payrollDays: 0, absentDays: 0, lateHours: 0, overtimeHours: 0, holidayWorkDays: 0, annualLeaveDays: 0, totalMesai: 0, totalGece: 0, totalTatil: 0, devamsizlik: 0, gecKalma: 0 }
  });

  // =========================================================
  // 1. VERİ ÇEKME VE BORDRO HESAPLAMA MOTORU (Core)
  // =========================================================
  const fetchWorkLogs = async () => {
    if (!user) return;
    setIsLoadingPayroll(true);
    const year = payrollDate.getFullYear();
    const month = payrollDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const logsMap = await fetchMonthWorkLogs(user.id, firstDayStr, lastDayStr);
    setFetchedLogs(logsMap ? Object.values(logsMap) : []);
    setIsLoadingPayroll(false);
  };

  useEffect(() => {
    fetchWorkLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payrollDate]);

  useEffect(() => {
    if (!settings) return;
    const computedData = generatePayrollData(settings, fetchedLogs, payrollDate, besDeduction, otherDeductions);
    // Tipleri uydurmak için any cast yapıyoruz (eski sistemden miras kalan objeler için)
    setPayrollData(computedData as unknown as LegacyPayrollData);
  }, [fetchedLogs, settings, besDeduction, otherDeductions, payrollDate]);

  // =========================================================
  // 2. DIŞA AKTARMA MOTORLARI (Utils)
  // =========================================================
  const getCalcExportName = (prefix: string) => {
    return generateFileName(`Vardiyo_${prefix}`, payrollDate, user?.user_metadata?.name, '');
  };

  const printCalcToPDF = (prefix: string) => {
    printDocumentAsPDF(getCalcExportName(prefix));
  };

  const exportPayrollCSV = () => {
    let csv = "\uFEFFKalem,Tutar (TL)\n";
    csv += `Aylik Maas,${payrollData.incomes.baseMonth.toFixed(2)}\n`;
    csv += `Gece Primi,${payrollData.incomes.nightBonus.toFixed(2)}\n`;
    csv += `Fazla Mesai,${payrollData.incomes.overtime.toFixed(2)}\n`;
    csv += `Resmi Tatil,${payrollData.incomes.holidayWork.toFixed(2)}\n`;
    csv += `Ek Kazanc,${payrollData.incomes.extra.toFixed(2)}\n`;
    csv += `Toplam Brut Hakedis,${payrollData.incomes.totalGrossHakedis.toFixed(2)}\n`;
    csv += `Devamsizlik,-${payrollData.deductionsGross.absent.toFixed(2)}\n`;
    csv += `Gec Kalma,-${payrollData.deductionsGross.late.toFixed(2)}\n`;
    csv += `Yeni Brut Matrah,${payrollData.newGrossMatrah.toFixed(2)}\n`;
    csv += `SGK Isci Primi,-${payrollData.taxes.sgk.toFixed(2)}\n`;
    csv += `Issizlik Primi,-${payrollData.taxes.unemployment.toFixed(2)}\n`;
    csv += `Gelir Vergisi,-${payrollData.taxes.incomeTax.toFixed(2)}\n`;
    csv += `Damga Vergisi,-${payrollData.taxes.stampTax.toFixed(2)}\n`;
    csv += `BES Kesintisi,-${payrollData.netKesintiler.bes.toFixed(2)}\n`;
    csv += `Diger Kesintiler,-${payrollData.netKesintiler.other.toFixed(2)}\n`;
    csv += `NET MAAS,${payrollData.hesabaYatanNet.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${getCalcExportName('Bordro')}.csv`;
    link.click();
  };

  const exportPayrollJSON = () => {
    downloadDataAsJSON(`${getCalcExportName('Bordro')}.json`, payrollData);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}">
      
      <ExportPanel 
        title="Bordroyu Dışa Aktar"
        description="Hesaplanan aylık bordro dökümünüzü cihazınıza indirin veya yazdırın."
        onExportCSV={exportPayrollCSV}
        onPrintPDF={() => printCalcToPDF('Bordro')}
        onExportJSON={exportPayrollJSON}
      />

      <div className="bg-[#16191d] rounded-xl border border-base-300 p-4 flex justify-between items-center shadow-lg">
        <button onClick={() => setPayrollDate(new Date(payrollDate.getFullYear(), payrollDate.getMonth() - 1, 1))} className="btn btn-sm btn-ghost hover:bg-base-200">&laquo; Önceki Ay</button>
        <h3 className="text-xl font-bold text-base-content">{new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(payrollDate)} Bordrosu</h3>
        <button onClick={() => setPayrollDate(new Date(payrollDate.getFullYear(), payrollDate.getMonth() + 1, 1))} className="btn btn-sm btn-ghost hover:bg-base-200">Sonraki Ay &raquo;</button>
      </div>

      <div className="bg-[#1e2329] p-5 rounded-xl border border-base-300 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-base-content/60 block mb-1">BES veya Özel Kesinti (₺)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-base-content/50">₺</span>
            <input type="number" placeholder="Yoksa 0 bırakın" value={besDeduction} onChange={(e) => setBesDeduction(e.target.value)} className="input input-bordered w-full bg-base-100 pl-7" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-base-content/60 block mb-1">Diğer Kesintiler (İcra, Avans vb.)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-base-content/50">₺</span>
            <input type="number" placeholder="Yoksa 0 bırakın" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} className="input input-bordered w-full bg-base-100 pl-7" />
          </div>
        </div>
      </div>

      {isLoadingPayroll ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-indigo-500"></span></div>
      ) : (
        <>
          {/* ANA MAAŞ KARTI */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-[#16191d] rounded-2xl border border-indigo-500/30 p-8 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row justify-between items-center">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-indigo-300 font-medium mb-1">Tahmini Hesaba Yatan Net Maaş</p>
              <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                {payrollData.hesabaYatanNet.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-3xl text-indigo-400">₺</span>
              </h1>
            </div>
            <div className="relative z-10 mt-4 sm:mt-0 text-right">
              <p className="text-sm text-base-content/60">Bordroya Esas Gün: <strong>{payrollData.stats.payrollDays} Gün</strong></p>
              <p className="text-sm text-base-content/60">Brüt Günlük: <strong>{payrollData.baseGrossInfo.daily.toFixed(2)} ₺</strong></p>
            </div>
          </div>

          {/* BORDRO ADIMLARI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1. BRÜT HAKEDİŞLER */}
            <div className="bg-[#16191d] rounded-xl border border-base-300 shadow-lg overflow-hidden">
              <div className="bg-emerald-900/20 p-4 border-b border-base-300">
                <h4 className="font-bold text-emerald-400">1. Brüt Hakedişler</h4>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-end border-b border-base-300/50 pb-2">
                  <p className="text-base-content/80 font-medium">Aylık Maaş ({payrollData.stats.payrollDays} Gün)</p>
                  <span className="font-bold text-base-content">+{payrollData.incomes.baseMonth.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between items-end border-b border-base-300/50 pb-2">
                  <p className="text-base-content/80 font-medium">Gece Primi (20:00-06:00 / {payrollData.calculatedNightHours} Saat)</p>
                  <span className="font-bold text-emerald-400">+{payrollData.incomes.nightBonus.toFixed(2)} ₺</span>
                </div>
                {payrollData.stats.overtimeHours > 0 && (
                  <div className="flex justify-between items-end border-b border-base-300/50 pb-2">
                    <p className="text-base-content/80 font-medium">Fazla Mesai ({payrollData.stats.overtimeHours} Saat)</p>
                    <span className="font-bold text-emerald-400">+{payrollData.incomes.overtime.toFixed(2)} ₺</span>
                  </div>
                )}
                {payrollData.stats.holidayWorkDays > 0 && (
                  <div className="flex justify-between items-end pb-2">
                    <p className="text-base-content/80 font-medium">Resmi Tatil ({payrollData.stats.holidayWorkDays} Gün)</p>
                    <span className="font-bold text-emerald-400">+{payrollData.incomes.holidayWork.toFixed(2)} ₺</span>
                  </div>
                )}

                <div className="pt-2 border-t border-base-300 flex justify-between items-center text-sm bg-base-200 p-2 rounded">
                  <span className="font-bold">Toplam Brüt Hakediş</span>
                  <span className="font-bold text-emerald-400">{payrollData.incomes.totalGrossHakedis.toFixed(2)} ₺</span>
                </div>
              </div>
            </div>

            {/* 2. BRÜT KESİNTİLER & YENİ MATRAH */}
            <div className="flex flex-col gap-6">
              <div className="bg-[#16191d] rounded-xl border border-base-300 shadow-lg overflow-hidden">
                <div className="bg-amber-900/20 p-4 border-b border-base-300">
                  <h4 className="font-bold text-amber-500">2. Brüt Kesintiler</h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-end border-b border-base-300/50 pb-2">
                    <p className="text-base-content/80 font-medium">Devamsızlık / Ücretsiz İzin ({payrollData.stats.absentDays} Gün)</p>
                    <span className="font-bold text-amber-500">-{payrollData.deductionsGross.absent.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between items-end pb-2">
                    <p className="text-base-content/80 font-medium">Geç Kalma ({payrollData.stats.lateHours} Saat)</p>
                    <span className="font-bold text-amber-500">-{payrollData.deductionsGross.late.toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900/20 rounded-xl border border-indigo-500/30 p-4 flex justify-between items-center shadow-inner">
                <span className="font-bold text-indigo-300">3. Yeni Brüt Matrah (SGK Öncesi)</span>
                <span className="text-xl font-black text-white">{payrollData.newGrossMatrah.toFixed(2)} ₺</span>
              </div>
            </div>

            {/* 4. YASAL KESİNTİLER */}
            <div className="bg-[#16191d] rounded-xl border border-base-300 shadow-lg overflow-hidden md:col-span-2">
              <div className="bg-red-900/20 p-4 border-b border-base-300">
                <h4 className="font-bold text-red-400">4. Yasal Kesintiler (SGK ve Vergiler)</h4>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-base-content/60 font-bold mb-1">SGK İşçi Primi (%14)</p>
                  <p className="font-bold text-red-400">-{payrollData.taxes.sgk.toFixed(2)} ₺</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60 font-bold mb-1">İşsizlik Primi (%1)</p>
                  <p className="font-bold text-red-400">-{payrollData.taxes.unemployment.toFixed(2)} ₺</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60 font-bold mb-1">Gelir Vergisi (İstisna Düşülmüş)</p>
                  <p className="font-bold text-red-400">-{payrollData.taxes.incomeTax.toFixed(2)} ₺</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60 font-bold mb-1">Damga Vergisi (İstisna Düşülmüş)</p>
                  <p className="font-bold text-red-400">-{payrollData.taxes.stampTax.toFixed(2)} ₺</p>
                </div>
              </div>
              <div className="bg-base-200 p-4 flex justify-between items-center border-t border-base-300">
                <span className="font-bold">Net Maaş (Vergi Sonrası)</span>
                <span className="font-bold text-lg text-emerald-400">{payrollData.netMaaş.toFixed(2)} ₺</span>
              </div>
            </div>

            {/* 5. ÖZEL KESİNTİLER */}
            {payrollData.netKesintiler.total > 0 && (
              <div className="bg-[#16191d] rounded-xl border border-base-300 shadow-lg overflow-hidden md:col-span-2">
                <div className="bg-orange-900/20 p-4 border-b border-base-300 flex justify-between">
                  <h4 className="font-bold text-orange-400">5. Özel Kesintiler (Net Üzerinden)</h4>
                  <span className="font-bold text-orange-400">-{payrollData.netKesintiler.total.toFixed(2)} ₺</span>
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}