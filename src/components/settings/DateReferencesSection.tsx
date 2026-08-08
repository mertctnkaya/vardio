import type { DateReferencesSectionProps } from '../../types';

export default function DateReferencesSection({
  workType, employmentStartDate, setEmploymentStartDate, shiftEpochDate, setShiftEpochDate
}: DateReferencesSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">2. Tarih Referansları</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-control w-full">
          <label className="label"><span className="label-text font-bold text-base-content/80">İşe Başlama Tarihi</span></label>
          <input type="date" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={employmentStartDate} onChange={(e) => setEmploymentStartDate(e.target.value)} />
        </div>

        {workType !== 'fixed' && (
          <div className="form-control w-full animate-fade-in">
            <label className="label"><span className="label-text font-bold text-base-content/80">Döngü Başlangıcı (Gündüz)</span></label>
            <input type="date" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={shiftEpochDate} onChange={(e) => setShiftEpochDate(e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}