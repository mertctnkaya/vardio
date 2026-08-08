import type { BroadcastTabProps } from '../../types';

export default function BroadcastTab({
  title,
  message,
  isBroadcasting,
  onTitleChange,
  onMessageChange,
  onSend
}: BroadcastTabProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="card bg-[#16191d] shadow-xl border border-blue-500/30">
        <div className="card-body p-6 sm:p-8">
          <h2 className="card-title text-blue-400 border-b border-base-300 pb-2 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Sistem Duyurusu Yayınla (Push)
          </h2>
          
          <div className="space-y-6">
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
              <p className="text-sm text-blue-300/80">
                Buradan göndereceğiniz mesajlar, ayarlarından <strong>"Vardiyo Yenilikleri"</strong> bildirimini açmış olan tüm kullanıcıların cihazlarına anında iletilecektir.
              </p>
            </div>

            <div>
              <label className="label text-xs font-bold text-base-content/70">DUYURU BAŞLIĞI</label>
              <input 
                type="text" 
                className="input input-bordered w-full bg-base-200 focus:border-blue-500 transition-colors" 
                placeholder="Örn: Vardiyo v1.2 Güncellemesi!" 
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                disabled={isBroadcasting}
              />
            </div>
            
            <div>
              <label className="label text-xs font-bold text-base-content/70">MESAJ İÇERİĞİ</label>
              <textarea 
                className="textarea textarea-bordered w-full bg-base-200 h-32 focus:border-blue-500 transition-colors resize-none" 
                placeholder="Kullanıcılara iletilecek detaylı mesajı buraya yazın..."
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                disabled={isBroadcasting}
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t border-base-300">
              <button 
                onClick={onSend} 
                disabled={isBroadcasting || !title.trim() || !message.trim()} 
                className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-900/40 px-10"
              >
                {isBroadcasting ? <span className="loading loading-spinner"></span> : 'Duyuruyu Yayınla'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}