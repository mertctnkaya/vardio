import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calculateSeverance } from '../../core/severanceEngine';
import type { SeveranceResult } from '../../types';
import Alert from '../shared/Alert';
import Icon from '../shared/Icon';
import ExportPanel from '../shared/ExportPanel';
import { printDocumentAsPDF, downloadDataAsJSON, generateFileName } from '../../utils/exportUtils';

export default function SeveranceTab() {
  const { settings, user } = useAppStore();
  
  const [terminationDate, setTerminationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [payNotice, setPayNotice] = useState<boolean>(true);
  const [severanceResult, setSeveranceResult] = useState<SeveranceResult | null>(null);

  const handleCalculate = () => {
    if (!settings || !settings.employment_start_date) return;

    const result = calculateSeverance(
      settings,
      terminationDate,
      payNotice
    );
    setSeveranceResult(result);
  };

  // --- DIŞA AKTARMA FONKSİYONLARI ---
  const exportTazminatCSV = () => {
    if (!severanceResult) return;
    let csv = "\uFEFFKalem,Deger\n";
    csv += `Calisilan Sure (Yil),${severanceResult.yearsWorked.toFixed(2)}\n`;
    csv += `Brut Kidem,${severanceResult.severanceGross.toFixed(2)}\n`;
    csv += `Kidem Damga Vergisi,-${severanceResult.severanceStampTax.toFixed(2)}\n`;
    csv += `Net Kidem,${severanceResult.severanceNet.toFixed(2)}\n`;
    csv += `Ihbar Suresi (Hafta),${severanceResult.noticeWeeks}\n`;
    csv += `Brut Ihbar,${severanceResult.noticeGross.toFixed(2)}\n`;
    csv += `Ihbar Vergi Kesintisi,-${(severanceResult.noticeIncomeTax + severanceResult.noticeStampTax).toFixed(2)}\n`;
    csv += `Net Ihbar,${severanceResult.noticeNet.toFixed(2)}\n`;
    csv += `TOPLAM NET TAZMINAT,${severanceResult.totalNet.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${generateFileName('Tazminat', new Date(), user?.user_metadata?.name || 'Kullanici', '')}.csv`;
    link.click();
  };

  const exportTazminatJSON = () => {
    if (!severanceResult) return;
    downloadDataAsJSON(
      `${generateFileName('Tazminat', new Date(), user?.user_metadata?.name || 'Kullanici', '')}.json`, 
      severanceResult
    );
  };

  if (!settings?.employment_start_date) {
    return (
      <Alert color="amber" title="Eksik Bilgi" icon="warning">
        Tazminat hesaplayabilmek için Ayarlar sayfasından "İşe Başlama Tarihi" ve "Aylık Brüt Maaş" bilgilerinizi doldurmanız gerekmektedir.
      </Alert>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
      
      {/* ÜST PANEL: YENİ SEVİLEN İNPUT TASARIMI */}
      <div className="bg-[#1e2329] rounded-xl border border-base-300 p-6 sm:p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-2 border-b border-base-300 pb-4">
          <Icon name="calendar" className="w-6 h-6 text-amber-500" />
          Kıdem ve İhbar Tazminatı Hesaplama
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-base-content/80">İşe Başlama Tarihiniz</span>
            </label>
            <input 
              type="date" 
              className="input input-bordered w-full bg-base-200 opacity-60" 
              value={settings.employment_start_date} 
              disabled 
            />
            <label className="label p-1">
              <span className="label-text-alt text-base-content/40">* Ayarlar sayfasından alınmıştır.</span>
            </label>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-base-content/80">İşten Ayrılış / Çıkış Tarihi</span>
            </label>
            <input 
              type="date" 
              className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-amber-500" 
              value={terminationDate} 
              onChange={(e) => setTerminationDate(e.target.value)} 
            />
          </div>

          <div className="form-control w-full md:col-span-2">
            <label className="cursor-pointer label bg-base-200 p-4 rounded-xl border border-base-300/50 hover:border-amber-500/30 transition-colors flex justify-between items-center">
              <span className="label-text font-bold text-base-content/80 flex items-center gap-2">
                <Icon name="info" className="w-5 h-5 text-amber-400" />
                İhbar Süresi Kullandırılacak Mı? (Hemen mi çıkıyorsunuz?)
              </span>
              <input 
                type="checkbox" 
                className="toggle bg-base-300 border-red-500 hover:bg-base-100 checked:bg-emerald-500 checked:border-emerald-500 hover:checked:bg-emerald-700 [--tglbg:white]" 
                checked={payNotice} 
                onChange={(e) => setPayNotice(e.target.checked)} 
              />
            </label>
            <p className="text-xs text-base-content/50 mt-2 ml-1">
              * Kapalı (Kırmızı) ise ihbar sürenizi çalışarak geçirirsiniz (İhbar tazminatı ödenmez). Açık (Yeşil) ise bugün çıkarılırsınız ve ihbar tazminatınız peşin ödenir.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button onClick={handleCalculate} className="btn w-full bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-900/50 text-lg h-14">
            Tazminatımı Hesapla
          </button>
        </div>
      </div>

      {/* ALT PANEL: ESKİ ÖZLENEN DETAYLI TURUNCU TASARIM */}
      {severanceResult && (
        <div className="space-y-6 animate-fade-in mt-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#16191d] p-5 rounded-xl border border-base-300 shadow-lg">
              <h4 className="font-bold text-base-content/70 mb-4 border-b border-base-300 pb-2">Kıdem Tazminatı</h4>
              <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Çalışılan Süre:</span> <span className="font-bold">{severanceResult.yearsWorked.toFixed(2)} Yıllık Hizmet Karşılığı</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Brüt Kıdem:</span> <span className="font-bold">{severanceResult.severanceGross.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Damga Vergisi Kesintisi:</span> <span className="text-red-400">-{severanceResult.severanceStampTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></div>
              <div className="flex justify-between text-lg mt-4 pt-2 border-t border-base-300"><span className="font-bold text-amber-500">Net Kıdem:</span> <span className="font-black text-amber-400">{severanceResult.severanceNet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></div>
              {severanceResult.yearsWorked < 1 && <p className="text-xs text-red-400 mt-2">1 tam yılı doldurmadığınız için kıdem tazminatına hak kazanamazsınız.</p>}
            </div>

            <div className={`bg-[#16191d] p-5 rounded-xl border border-base-300 shadow-lg transition-all ${!payNotice ? 'opacity-40 grayscale' : ''}`}>
              <h4 className="font-bold text-base-content/70 mb-4 border-b border-base-300 pb-2">İhbar Tazminatı</h4>
              <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">İhbar Süresi:</span> <span className="font-bold">{severanceResult.noticeWeeks} Haftalık Bildirim Karşılığı</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Brüt İhbar:</span> <span className="font-bold">{severanceResult.noticeGross.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Vergi (GV + DV):</span> <span className="text-red-400">-{(severanceResult.noticeIncomeTax + severanceResult.noticeStampTax).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></div>
              <div className="flex justify-between text-lg mt-4 pt-2 border-t border-base-300"><span className="font-bold text-amber-500">Net İhbar:</span> <span className="font-black text-amber-400">{severanceResult.noticeNet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></div>
            </div>
          </div>

          <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 text-center shadow-inner">
            <p className="text-sm font-bold text-amber-500/70 uppercase tracking-widest mb-1">Hesaba Yatacak Toplam Net Tazminat</p>
            <p className="text-5xl sm:text-6xl font-black text-amber-400">{severanceResult.totalNet.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
            <p className="text-xs text-base-content/40 mt-3">* Tavan uygulaması hesaplamaya dahil edilmemiş olup, gelir vergisi sabit %15 kabul edilmiştir.</p>
          </div>

          <ExportPanel 
            title="Raporu Dışa Aktar"
            description="Kıdem ve ihbar tazminatı dökümünüzü indirin veya yazdırın."
            onExportCSV={exportTazminatCSV}
            onPrintPDF={() => printDocumentAsPDF(generateFileName('Tazminat', new Date(), user?.user_metadata?.name || 'Kullanici', ''))}
            onExportJSON={exportTazminatJSON}
          />
        </div>
      )}
    </div>
  );
}