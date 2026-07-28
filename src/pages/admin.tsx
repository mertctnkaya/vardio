import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAppStore();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'stats'>('messages');
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({ usersCount: 0, logsCount: 0, remindersCount: 0 });

  useEffect(() => {
    // Güvenlik Duvarı: Kullanıcı yoksa veya e-posta eşleşmiyorsa ana sayfaya postala
    if (!user) return;
    if (user.email !== 'm3rt7132@gmail.com') {
      navigate('/');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Gelen Mesajları Çek (En yeni en üstte)
    const { data: msgData } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (msgData) setMessages(msgData);

    // 2. İstatistikleri Çek (Ayarı olan kullanıcı sayısı, toplam girilen mesai, toplam hatırlatıcı)
    const { count: uCount } = await supabase.from('user_settings').select('*', { count: 'exact', head: true });
    const { count: lCount } = await supabase.from('work_logs').select('*', { count: 'exact', head: true });
    const { count: rCount } = await supabase.from('reminders').select('*', { count: 'exact', head: true });
    
    setStats({ 
      usersCount: uCount || 0, 
      logsCount: lCount || 0, 
      remindersCount: rCount || 0 
    });

    setIsLoading(false);
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    fetchData();
  };

  // Render Güvenliği: Yanlışlıkla biri buraya girerse boş sayfa görsün
  if (user?.email !== 'm3rt7132@gmail.com') return null;

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10">
      
      {/* BAŞLIK */}
      <div className="w-full max-w-5xl mb-6 px-2">
        <div className="bg-gradient-to-r from-emerald-900/40 to-[#16191d] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              👑 Yönetim Paneli
            </h2>
            <p className="text-emerald-400/80 text-lg mt-1 font-medium">
              Sistem senindir.
            </p>
          </div>
          <div className="hidden sm:block relative z-10 text-right">
            <p className="text-xs text-base-content/50 uppercase font-bold tracking-widest">YETKİLİ HESAP</p>
            <p className="font-bold text-emerald-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* SEKMELER */}
      <div className="w-full max-w-5xl px-2 mb-6">
        <div className="tabs tabs-boxed bg-[#16191d] p-1 border border-base-300">
          <a 
            className={`tab tab-lg ${activeTab === 'messages' ? 'bg-emerald-600 text-white font-bold' : 'text-base-content/60 hover:text-white'}`} 
            onClick={() => setActiveTab('messages')}
          >
            Gelen Mesajlar ({messages.length})
          </a>
          <a 
            className={`tab tab-lg ${activeTab === 'stats' ? 'bg-emerald-600 text-white font-bold' : 'text-base-content/60 hover:text-white'}`} 
            onClick={() => setActiveTab('stats')}
          >
            Sistem İstatistikleri
          </a>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        {isLoading ? (
          <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-emerald-500"></span></div>
        ) : (
          <>
            {/* MESAJLAR SEKME İÇERİĞİ */}
            {activeTab === 'messages' && (
              <div className="space-y-4 px-2">
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
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)} 
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 btn btn-sm btn-circle btn-ghost text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-900/20 transition-all"
                        title="Mesajı Sil"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* İSTATİSTİKLER SEKME İÇERİĞİ */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                <div className="bg-[#16191d] rounded-2xl border border-base-300 p-8 shadow-lg text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-widest mb-2 relative z-10">Aktif Profİller</h3>
                  <p className="text-5xl font-black text-white relative z-10">{stats.usersCount}</p>
                  <p className="text-xs text-base-content/40 mt-2 relative z-10">Ayarlarını kaydeden tekil kullanıcı sayısı</p>
                </div>
                <div className="bg-[#16191d] rounded-2xl border border-base-300 p-8 shadow-lg text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-widest mb-2 relative z-10">Gİrİlen Mesaİler</h3>
                  <p className="text-5xl font-black text-emerald-400 relative z-10">{stats.logsCount}</p>
                  <p className="text-xs text-base-content/40 mt-2 relative z-10">Takvime işlenmiş toplam gün/vardiya</p>
                </div>
                <div className="bg-[#16191d] rounded-2xl border border-base-300 p-8 shadow-lg text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-widest mb-2 relative z-10">Hatırlatıcılar</h3>
                  <p className="text-5xl font-black text-orange-400 relative z-10">{stats.remindersCount}</p>
                  <p className="text-xs text-base-content/40 mt-2 relative z-10">Kullanıcıların eklediği toplam not/hatırlatma</p>
                </div>
                
                <div className="md:col-span-3 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 mt-4 flex items-start gap-4 shadow-inner">
                  <span className="text-2xl mt-1">💡</span>
                  <div>
                    <h4 className="font-bold text-emerald-400">Yönetici Notu</h4>
                    <p className="text-sm text-base-content/70 mt-1">
                      Kullanıcıların şifreleri, e-posta adresleri ve kimlik doğrulama ayarları güvenliğiniz gereği sadece <strong className="text-white">Supabase Dashboard</strong> üzerinden yönetilebilir. Ön yüzden sadece kullanıcı davranışlarını ve sisteme bindirilen yükü (istatistikleri) takip edebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}