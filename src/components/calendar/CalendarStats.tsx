import type { CalendarStatsProps } from "../../types";

export default function CalendarStats({ monthlyStats, baseDate }: CalendarStatsProps) {
  return (
    <>
      {/* YASAL DEVAMSIZLIK UYARISI EKRANI */}
      {monthlyStats.isDangerAbsent && (
        <div className="w-full max-w-4xl mt-6 bg-red-900/10 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm animate-fade-in flex gap-4 items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-bold text-red-500 text-lg">Yasal Uyarı: Devamsızlık Tehlike Sınırı!</h4>
            <p className="text-sm text-base-content/80 mt-1">
              Bu ay içerisinde <strong>{monthlyStats.maxConsecutiveAbsent >= 2 ? 'ardı ardına 2 gün' : 'toplam 3 gün'}</strong> devamsızlık yaptığınız tespit edildi. İş Kanunu Madde 25/II gereğince; mazeretsiz devamsızlıklar işverene <strong className="text-red-400">Tazminatsız Haklı Fesih (İşten Çıkarma)</strong> hakkı tanır. Lütfen durumunuzu yöneticinizle görüşün.
            </p>
          </div>
        </div>
      )}

      {/* TAKVİM ALTI: AYLIK ÖZET RAPORU */}
      <div className="w-full max-w-4xl mt-6 bg-[#16191d] rounded-xl border border-base-300 p-6 shadow-lg animate-fade-in">
        <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          {new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(baseDate)} Ayı Özet Raporu
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Normal Mesai</p>
            <p className="text-xl font-bold text-emerald-400">{monthlyStats.normal} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Hafta Tatili</p>
            <p className="text-xl font-bold text-base-content">{monthlyStats.weekendPaid} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Fazla Mesai</p>
            <p className="text-xl font-bold text-green-400">{monthlyStats.overtimeHours} Saat</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Resmi Tatil</p>
            <p className="text-xl font-bold text-yellow-300">{monthlyStats.holidayWork} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Yıllık İzin</p>
            <p className="text-xl font-bold text-pink-400">{monthlyStats.annualLeave} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Ücretli/Rapor</p>
            <p className="text-xl font-bold text-purple-400">{monthlyStats.leave} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Geç/Eksik</p>
            <p className="text-xl font-bold text-orange-400">{monthlyStats.lateHours} Saat</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Devamsızlık</p>
            <p className="text-xl font-bold text-red-400">{monthlyStats.absent} Gün</p>
          </div>
        </div>
      </div>
    </>
  );
}