import Icon from '../shared/Icon';
import type { ShiftSystemSectionProps } from '../../types';

export default function ShiftSystemSection({
  workType, setWorkType, shiftStartTime, setShiftStartTime, shiftEndTime, setShiftEndTime,
  shiftDuration, setShiftDuration, isSaturdayWorkday, setIsSaturdayWorkday
}: ShiftSystemSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">1. Vardiya Sistemi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-control w-full md:col-span-2">
          <label className="label"><span className="label-text font-bold text-base-content/80">Sistem Tipi</span></label>
          <select className="select select-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={workType} onChange={(e) => setWorkType(e.target.value)}>
            <option value="fixed">Sabit Gündüz (Örn: 08:00 - 18:00)</option>
            <option value="2-shift">2'li Vardiya (Örn: 12 Saatlik Döngü)</option>
            <option value="3-shift">3'lü Vardiya (Örn: 8 Saatlik Döngü)</option>
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label"><span className="label-text font-bold text-base-content/80">Gündüz/Başlangıç Saati</span></label>
          <input type="time" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={shiftStartTime} onChange={(e) => setShiftStartTime(e.target.value)} />
        </div>

        {workType === 'fixed' && (
          <div className="form-control w-full animate-fade-in">
            <label className="label"><span className="label-text font-bold text-base-content/80">Bitiş Saati</span></label>
            <input type="time" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={shiftEndTime} onChange={(e) => setShiftEndTime(e.target.value)} />
          </div>
        )}

        {workType === 'fixed' && (
          <div className="form-control w-full md:col-span-2 animate-fade-in mt-2">
            <label className="cursor-pointer label bg-base-200 p-4 rounded-xl border border-gray-500 hover:border-indigo-700 transition-colors flex justify-between items-center">
              <span className="label-text font-bold text-base-content/80 flex items-center gap-2">
                <Icon name="calendar" className="w-5 h-5 text-indigo-400" />
                Cumartesi günleri çalışma var mı?
              </span>
              <input 
                type="checkbox" 
                className="toggle bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 checked:bg-emerald-500 checked:border-emerald-500 checked:hover:bg-emerald-600 checked:hover:border-emerald-600 [--tglbg:white]" 
                checked={isSaturdayWorkday} 
                onChange={(e) => setIsSaturdayWorkday(e.target.checked)} 
              />
            </label>
          </div>
        )}

        {workType === '2-shift' && (
          <div className="form-control w-full animate-fade-in">
            <label className="label"><span className="label-text font-bold text-base-content/80">Vardiya Süresi (Saat)</span></label>
            <input type="number" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" placeholder="Örn: 12" value={shiftDuration} onChange={(e) => setShiftDuration(e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}