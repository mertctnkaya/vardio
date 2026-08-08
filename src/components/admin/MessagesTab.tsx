import type { MessagesTabProps } from '../../types';

export default function MessagesTab({ messages, onDeleteMessage }: MessagesTabProps) {
  return (
    <div className="space-y-4 px-2 animate-fade-in">
      {messages.length === 0 ? (
        <div className="bg-[#16191d] rounded-2xl border border-base-300 p-12 text-center shadow-lg">
          <span className="text-4xl">📭</span>
          <h3 className="text-xl font-bold mt-4 text-base-content/70">Gelen Kutusu Boş</h3>
          <p className="text-base-content/50 mt-1">Henüz kimse iletişim formunu kullanmamış.</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="bg-[#16191d] rounded-2xl border border-base-300 p-6 shadow-lg hover:border-emerald-500/30 transition-colors relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-base-300/50 pb-4 mb-4 gap-4">
              <div>
                <h4 className="font-bold text-lg text-base-content flex items-center gap-2">
                  {msg.name}
                  <span className="badge badge-sm badge-outline border-emerald-500/50 text-emerald-400 font-bold">{msg.topic}</span>
                </h4>
                <p className="text-sm text-base-content/60 mt-1 font-medium">İletişim: <span className="text-indigo-400">{msg.contact_info}</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-base-content/40 font-bold">GÖNDERİM TARİHİ</p>
                <p className="text-sm text-base-content/70">{new Date(msg.created_at).toLocaleString('tr-TR')}</p>
              </div>
            </div>
            <div className="bg-base-200/50 p-4 rounded-xl border border-base-300/50 text-base-content/80 leading-relaxed whitespace-pre-wrap">
              {msg.message}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onDeleteMessage(msg.id)}
                className="btn btn-sm px-4 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border-none transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Mesajı Sil
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}