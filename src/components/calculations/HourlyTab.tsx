import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calculateWageFromHourlyTarget } from '../../core/hourlyEngine';
import { updateUserSettings } from '../../services/dbService';
import type { HourlyCalcResult } from '../../types';

export default function HourlyTab() {
  const { settings, user, setSettings } = useAppStore();
  
  const [hourlyInputType, setHourlyInputType] = useState<'net' | 'gross'>('net');
  const [hourlyInputValue, setHourlyInputValue] = useState('');
  const [hourlyCalcResults, setHourlyCalcResults] = useState<HourlyCalcResult | null>(null);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const performHourlyCalculation = () => {
    const cleanValue = hourlyInputValue.replace(/\./g, '').replace(',', '.');
    const val = Number(cleanValue);
    if (!val || val <= 0) return;

    const baseHours = settings?.base_work_hours ? Number(settings.base_work_hours) : 7.5;
    const result = calculateWageFromHourlyTarget(val, hourlyInputType, baseHours);
    setHourlyCalcResults(result);
  };

  const saveHourlyToSettings = async () => {
    if (!user || !hourlyCalcResults) return;
    setIsSavingSettings(true);

    const { error, data } = await updateUserSettings(user.id, {
      daily_wage: hourlyCalcResults.dailyGross,
      hourly_overtime: hourlyCalcResults.overtimeGross
    });

    if (!error && data) {
      setSettings(data);
      setFeedback({ type: 'success', message: 'Saatlik katsayılarınız sisteme kaydedildi!' });
      setTimeout(() => { setFeedback(null); setHourlyCalcResults(null); setHourlyInputValue(''); }, 3000);
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
            <h3 className="text-xl font-bold text-sky-400 mb-2">Saatlik Ücretten Maaş Bul</h3>
            <p className="text-sm text-base-content/60 mb-6">Net veya brüt saatlik ücretinizi girin, sistem aylık maaşınızı ve katsayılarınızı oluşturup kaydetsin.</p>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setHourlyInputType('net')} className={`btn btn-sm flex-1 ${hourlyInputType === 'net' ? 'bg-sky-600 border-none text-white' : 'btn-outline border-base-300 text-base-content/70'}`}>Saatlik Net Gir</button>
              <button onClick={() => setHourlyInputType('gross')} className={`btn btn-sm flex-1 ${hourlyInputType === 'gross' ? 'bg-sky-600 border-none text-white' : 'btn-outline border-base-300 text-base-content/70'}`}>Saatlik Brüt Gir</button>
            </div>

            <div className="form-control w-full mb-4">
              <label className="input input-bordered flex items-center gap-2 bg-[#1e2329] focus-within:ring-2 focus-within:ring-sky-500 border-base-300 h-14">
                <span className="text-sky-400 font-bold text-lg">₺</span>
                <input
                  type="text"
                  className="grow text-lg font-bold"
                  placeholder={hourlyInputType === 'net' ? "Örn: 150 (Saatlik Net)" : "Örn: 185 (Saatlik Brüt)"}
                  value={hourlyInputValue}
                  onChange={(e) => setHourlyInputValue(e.target.value)}
                />
              </label>
            </div>
            <button onClick={performHourlyCalculation} className="btn w-full bg-sky-600 hover:bg-sky-700 text-white border-none shadow-lg shadow-sky-900/40">
              Hesapla
            </button>

            {feedback && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-bold flex justify-center animate-fade-in ${feedback.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {feedback.message}
              </div>
            )}
          </div>

          <div className="bg-[#1e2329] rounded-xl border border-base-300 p-6 flex flex-col justify-center shadow-inner">
            {hourlyCalcResults ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-base-300 pb-2">
                  <span className="text-base-content/70 font-medium">Aylık Brüt Maaş:</span>
                  <span className="text-lg font-bold text-white">{hourlyCalcResults.monthlyGross} ₺</span>
                </div>
                <div className="flex justify-between items-center border-b border-base-300 pb-2">
                  <span className="text-base-content/70 font-medium">Günlük Brüt (30 Gün):</span>
                  <span className="text-lg font-bold text-emerald-400">{hourlyCalcResults.dailyGross} ₺</span>
                </div>
                <div className="flex justify-between items-center border-b border-base-300 pb-2">
                  <span className="text-base-content/70 font-medium">Saatlik Brüt ({settings?.base_work_hours || 7.5} Saat):</span>
                  <span className="text-lg font-bold text-sky-400">{hourlyCalcResults.hourlyGross} ₺</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-base-content/70 font-medium">Saatlik Fazla Mesai (%50):</span>
                  <span className="text-lg font-bold text-indigo-400">{hourlyCalcResults.overtimeGross} ₺</span>
                </div>

                <button
                  onClick={saveHourlyToSettings}
                  disabled={isSavingSettings}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/50 w-full mt-4"
                >
                  {isSavingSettings ? <span className="loading loading-spinner"></span> : 'Sisteme Kaydet'}
                </button>
                <p className="text-xs text-base-content/40 text-center">* Kaydettiğinizde sistem aylık brüt tutarını otomatik hesaplayıp ayarlarınıza işler.</p>
              </div>
            ) : (
              <div className="text-center text-base-content/40 py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>Saatlik ücretinizi yazıp hesapla butonuna basın.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}