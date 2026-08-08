import type { NotificationPromoProps } from '../../types/currentShift';

export default function NotificationPromo({ showPromo, onRequest, onDismiss }: NotificationPromoProps) {
  if (!showPromo) return null;

  return (
    <div className="md:col-span-2 mt-2 bg-gradient-to-r from-emerald-900/40 to-[#16191d] border border-emerald-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden animate-fade-in group">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-base-content z-10"
        title="Şimdilik geç"
      >✕</button>

      <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>

      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        <div className="w-16 h-16 shrink-0 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h4 className="font-bold text-emerald-400 text-lg">Vardiya Dönüşlerini Kaçırmayın!</h4>
          <p className="text-sm text-base-content/70 mt-1">
            Pazar gecesinden uyku düzeni uyarıları, resmi tatil çift yevmiye fırsatları ve kaydettiğiniz hatırlatıcıları vs. cihazınıza anlık bildirim olarak almak ister misiniz?
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0 mr-0 sm:mr-2">
          <button onClick={onRequest} className="btn p-3 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/40">
            Evet, Bildirimleri Aç
          </button>
          <button onClick={onDismiss} className="btn btn-sm btn-ghost text-base-content/60 hover:bg-base-200">
            Belki Daha Sonra
          </button>
        </div>
      </div>
    </div>
  );
}