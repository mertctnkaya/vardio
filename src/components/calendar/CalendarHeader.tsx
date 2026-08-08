import type { CalendarHeaderProps } from '../../types/calendar';

export default function CalendarHeader({ baseDate, onPrev, onNext, onToday }: CalendarHeaderProps) {
  return (
    <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center mb-6 px-2 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-base-content min-w-[200px] text-center sm:text-left">
          {new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(baseDate)}
        </h2>
        <div className="flex gap-2">
          <button onClick={onPrev} className="btn btn-sm sm:btn-md btn-outline bg-green-800 p-2 border-text-base-content/70 hover:bg-green-900">&laquo; Önceki Ay</button>
          <button onClick={onToday} className="btn btn-sm sm:btn-md p-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md">Bugün</button>
          <button onClick={onNext} className="btn btn-sm sm:btn-md btn-outline bg-green-800 p-2 border-text-base-content/70 hover:bg-green-900">Sonraki Ay &raquo;</button>
        </div>
      </div>
      <div className="badge badge-primary badge-outline font-semibold whitespace-nowrap hidden sm:inline-flex">
        Bordro Dönemi
      </div>
    </div>
  );
}