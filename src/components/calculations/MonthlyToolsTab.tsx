import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calculateWageFromMonthlyTarget } from '../../core/hourlyEngine';
import { updateUserSettings } from '../../services/dbService';
import type { HourlyCalcResult } from '../../types';

export default function MonthlyToolsTab() {
  const { settings, user, setSettings } = useAppStore();
  
  const [calcTargetType, setCalcTargetType] = useState<'gross' | 'net'>('net');
  const [calcTargetValue, setCalcTargetValue] = useState('');
  const [calcResults, setCalcResults] = useState<HourlyCalcResult | null>(null);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const performCalculation = () => {
    const cleanValue = calcTargetValue.replace(/\./g, '').replace(',', '.');
    const val = Number(cleanValue);
    if (!val || val <= 0) return;

    const baseHours = settings?.base_work_hours ? Number(settings.base_work_hours) : 7.5;
    const result = calculateWageFromMonthlyTarget(val, calcTargetType, baseHours);
    setCalcResults(result);
  };

  const saveToSettings = async () => {
    if (!user || !calcResults) return;
    setIsSavingSettings(true);

    const { error, data } = await updateUserSettings(user.id, {
      daily_wage: calcResults.dailyGross,
      hourly_overtime: calcResults.overtimeGross
    });

    if (!error && data) {
      setSettings(data);
      setFeedback({ type: 'success', message: 'Maaş katsayılarınız sisteme otomatik kaydedildi!' });
      setTimeout(() => { setFeedback(null); setCalcResults(null); setCalcTargetValue(''); }, 3000);
    } else {
      setFeedback({ type: 'error', message: 'Kaydedilirken hata oluştu: ' + (error?.message || '') });
      setTimeout(() => setFeedback(null), 3000);
    }
    setIsSavingSettings(false);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in px-2 sm:px-0">
      <div className="bg-[#16191d] rounded-xl shadow-2xl border border-base-300 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-indigo-400 mb-2">Maaştan Katsayı Bul & Kaydet</h3>
            <p className="text-sm text-base-content/60 mb-6">Aylık net veya brüt maaşınızı girerek günlük/saatlik katsayılarınızı sisteme otomatik kaydedin.</p>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setCalcTargetType('net')} className={`btn btn-sm flex-1 ${calcTargetType === 'net' ? 'bg-indigo-600 border-none text-white' : 'btn-outline border-base-300 text-base-content/70'}`}>Aylık Net Gir</button>
              <button onClick={() => setCalcTargetType('gross')} className={`btn btn-sm flex-1 ${calcTargetType === 'gross' ? 'bg-indigo-600 border-none text-white' : 'btn-outline border-base-300 text-base-content/70'}`}>Aylık Brüt Gir</button>
            </div>

            <div className="form-control w-full mb-4">
              <label className="input input-bordered flex items-center gap-2 bg-[#1e2329] focus-within:ring-2 focus-within:ring-indigo-500 border-base-300 h-14">
                <span className="text-indigo-400 font-bold text-lg">₺</span>
                <input
                  type="text"
                  className="grow text-lg font-bold"
                  placeholder={calcTargetType === 'net' ? "Örn: 33750 (Aylık Net)" : "Örn: 38811 (Aylık Brüt)"}
                  value={calcTargetValue}
                  onChange={(e) => setCalcTargetValue(e.target.value)}
                />
              </label>
            </div>
            <button onClick={performCalculation} className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-900/40">
              Hesapla
            </button>

            {feedback && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-bold flex justify-center animate-fade-in ${feedback.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {feedback.message}
              </div>
            )}
          </div>

          <div className="bg-[#1e2329] rounded-xl border border-base-300 p-6 flex flex-col justify-center shadow-inner">
            {calcResults ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-base-300 pb-2">
                  <span className="text-base-content/70 font-medium">Aylık Brüt Maaş:</span>
                  <span className="text-lg font-bold text-white">{calcResults.monthlyGross} ₺</span>
                </div>
                <div className="flex justify-between items-center border-b border-base-300 pb-2">
                  <span className="text-base-content/70 font-medium">Günlük Brüt (30 Gün):</span>
                  <span className="text-lg font-bold text-emerald-400">{calcResults.dailyGross} ₺</span>
                </div>
                <div className="flex justify-between items-center border-b border-base-300 pb-2">
                  <span className="text-base-content/70 font-medium">Saatlik Brüt ({settings?.base_work_hours || 7.5} Saat):</span>
                  <span className="text-lg font-bold text-blue-400">{calcResults.hourlyGross} ₺</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-base-content/70 font-medium">Saatlik Fazla Mesai (%50):</span>
                  <span className="text-lg font-bold text-indigo-400">{calcResults.overtimeGross} ₺</span>
                </div>

                <button
                  onClick={saveToSettings}
                  disabled={isSavingSettings}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/50 w-full mt-4"
                >
                  {isSavingSettings ? <span className="loading loading-spinner"></span> : 'Sisteme Kaydet'}
                </button>
                <p className="text-xs text-base-content/40 text-center">* Kaydettiğinizde veritabanında "Aylık Brüt / 30" formülü ile sistemin beyni güncellenir.</p>
              </div>
            ) : (
              <div className="text-center text-base-content/40 py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110-4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                <p>Maaşınızı yazıp hesapla butonuna basın.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}