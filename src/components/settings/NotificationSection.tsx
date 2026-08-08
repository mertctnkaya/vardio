import Icon from '../shared/Icon';
import type { NotificationSectionProps } from '../../types';

export default function NotificationSection({ notificationStatus, onRequestPermission, prefs, onToggle }: NotificationSectionProps) {

  const toggleClass = "toggle bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 checked:bg-emerald-500 checked:border-emerald-500 checked:hover:bg-emerald-600 checked:hover:border-emerald-600 [--tglbg:white]";

  return (
    <div className="card bg-[#16191d] shadow-xl border border-base-300 animate-fade-in mt-6">
      <div className="card-body p-6">
        <h2 className="card-title text-emerald-500 border-b border-base-300 pb-2 mb-6 flex items-center gap-2">
          <Icon name="bell" className="w-5 h-5" />
          Bildirim Ayarları
        </h2>

        {/* TARAYICI İZİN KONTROLÜ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-200 p-4 rounded-xl border border-emerald-500/70 mb-8">
          <div>
            <h4 className="font-bold text-base-content text-lg">Cihaz Bildirimleri (Push Notifications)</h4>
            <p className="text-sm text-base-content/60 mt-1 max-w-md">Tarayıcı üzerinden anlık bildirim alabilmek için cihaz izni gereklidir.</p>
          </div>
          <div>
            {notificationStatus === 'default' && (
              <button onClick={onRequestPermission} className="btn btn-sm h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/40 w-full sm:w-auto">
                Cihaz İznini Ver
              </button>
            )}
            {notificationStatus === 'granted' && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/30">
                <Icon name="check" className="w-4 h-4" />
                <span className="font-bold">Açık (Aktif)</span>
              </div>
            )}
            {notificationStatus === 'denied' && (
              <div className="flex flex-col items-end gap-2 text-right">
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
                  <Icon name="close" className="w-4 h-4" />
                  <span className="font-bold">Engellendi</span>
                </div>
                <span className="text-[10px] text-red-400/80 max-w-[200px] leading-tight">
                  * Tarayıcı kilit (🔒) ikonuna tıklayıp engeli kaldırmalısınız.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 10 ADET DETAYLI BİLDİRİM TERCİHİ */}
        <div className={`space-y-2 transition-opacity duration-300 ${notificationStatus !== 'granted' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <h4 className="font-bold text-base-content/80 mb-4 px-2 uppercase tracking-wider text-xs">Nelerden haberdar olmak istersiniz?</h4>

          {/* 1. Vardiya Dönüşümü */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-900/30 flex items-center justify-center text-indigo-400">🔄</div>
              <div>
                <span className="label-text font-bold text-base-content block">Vardiya Dönüşüm Uyarıları</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Hafta başı vardiyanız değiştiğinde uyku düzeni hatırlatması.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.shift_changes} onChange={() => onToggle('shift_changes')} />
          </label>

          {/* 2. Resmi Tatil */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-yellow-900/30 flex items-center justify-center text-yellow-500">🎉</div>
              <div>
                <span className="label-text font-bold text-base-content block">Resmi Tatil Fırsatları</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Yaklaşan resmi tatiller ve çift yevmiye fırsatları.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.holidays} onChange={() => onToggle('holidays')} />
          </label>

          {/* 3. Hatırlatıcılar */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-orange-900/30 flex items-center justify-center text-orange-400">⏰</div>
              <div>
                <span className="label-text font-bold text-base-content block">Kişisel Hatırlatıcılar</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Takvime eklediğiniz notların zamanında hatırlatılması.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.reminders} onChange={() => onToggle('reminders')} />
          </label>

          {/* 4. Bordro */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400">💰</div>
              <div>
                <span className="label-text font-bold text-base-content block">Aylık Kapanış & Bordro</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Ay bittiğinde toplam net maaşınızın bildirilmesi.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.payroll} onChange={() => onToggle('payroll')} />
          </label>

          {/* 5. Yasal Risk */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-red-900/30 flex items-center justify-center text-red-400">⚠️</div>
              <div>
                <span className="label-text font-bold text-base-content block">Devamsızlık & Risk Radarı</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Tazminatsız çıkış sınırına yaklaştığınızda acil durum uyarıları.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.risks} onChange={() => onToggle('risks')} />
          </label>

          {/* 6. Yıllık İzin Hakedişi */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-pink-900/30 flex items-center justify-center text-pink-400">🌴</div>
              <div>
                <span className="label-text font-bold text-base-content block">Yıllık İzin Hakedişi</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Kıdem yılınızı doldurduğunuzda gelen izin güncellenme uyarısı.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.annual_leave} onChange={() => onToggle('annual_leave')} />
          </label>

          {/* 7. Günlük Mesai Hatırlatması */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-sky-900/30 flex items-center justify-center text-sky-400">📝</div>
              <div>
                <span className="label-text font-bold text-base-content block">Günlük Takvim Hatırlatması</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">"Bugün mesaiye kaldınız mı? Takvime işlemeyi unutmayın." uyarıları.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.daily_log} onChange={() => onToggle('daily_log')} />
          </label>

          {/* 8. Haftalık Özet */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400">📊</div>
              <div>
                <span className="label-text font-bold text-base-content block">Haftalık Rapor Özeti</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Pazar günleri haftalık çalışma sürenizin ve mesailerinizin özeti.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.weekly_summary} onChange={() => onToggle('weekly_summary')} />
          </label>

          {/* 9. Gece Vardiyası Sağlık */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-teal-900/30 flex items-center justify-center text-teal-400">🌙</div>
              <div>
                <span className="label-text font-bold text-base-content block">Gece Vardiyası Sağlık Asistanı</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Gece vardiyalarında beslenme ve kahve tüketimi tavsiyeleri.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.night_shift_health} onChange={() => onToggle('night_shift_health')} />
          </label>

          {/* 10. Sistem Güncellemeleri */}
          <label className="cursor-pointer flex justify-between items-center bg-base-200/50 hover:bg-base-200 p-4 rounded-xl border border-base-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">🚀</div>
              <div>
                <span className="label-text font-bold text-base-content block">Vardiyo Yenilikleri</span>
                <span className="label-text-alt text-base-content/50 leading-relaxed">Sisteme eklenen yeni özellikler ve güncellemeler hakkında duyurular.</span>
              </div>
            </div>
            <input type="checkbox" className={toggleClass} checked={prefs.app_updates} onChange={() => onToggle('app_updates')} />
          </label>

        </div>
      </div>
    </div>
  );
}