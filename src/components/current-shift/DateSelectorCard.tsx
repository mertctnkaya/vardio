import type { DateSelectorCardProps } from '../../types/currentShift';

export default function DateSelectorCard({ targetDate, formattedDateValue, onDateChange, onShiftDate, onSetToday }: DateSelectorCardProps) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body items-center text-center w-full">
        {/* Başlık */}
        <h2 className="card-title text-xl mb-4 text-base-content/80">
          Tarih Sorgula
        </h2>

        {/* Tarih Inputu */}
        <input
          type="date"
          value={formattedDateValue}
          onChange={onDateChange}
          className="input input-bordered w-full max-w-xs text-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Dün / Yarın Butonları */}
        <div className="flex items-center justify-between w-full max-w-xs mt-6 gap-2">
          <button onClick={() => onShiftDate(-1)} className="btn btn-sm flex-1 bg-slate-700 hover:bg-slate-600 text-white border-none">
            &larr; Dün
          </button>
          <span className="text-sm font-semibold text-base-content whitespace-nowrap px-2">
            {targetDate.toLocaleDateString("tr-TR", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </span>
          <button onClick={() => onShiftDate(1)} className="btn btn-sm flex-1 bg-slate-700 hover:bg-slate-600 text-white border-none">
            Yarın &rarr;
          </button>
        </div>

        {/* Hafta Atlama Butonları */}
        <div className="flex items-center justify-between w-full max-w-xs mt-3 gap-3">
          <button onClick={() => onShiftDate(-7)} className="btn btn-sm flex-1 bg-indigo-600 hover:bg-indigo-500 text-white border-none">
            &laquo; Önceki Hf.
          </button>
          <button onClick={() => onShiftDate(7)} className="btn btn-sm flex-1 bg-indigo-600 hover:bg-indigo-500 text-white border-none">
            Gelecek Hf. &raquo;
          </button>
        </div>
        
        {/* Bugüne Dön Butonu */}
        <div className="flex items-center justify-between w-full max-w-xs mt-2 gap-3">
          <button onClick={onSetToday} className="btn btn-sm flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md">
            Bugün
          </button>
        </div>
      </div>
    </div>
  );
}