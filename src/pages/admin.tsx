import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store/useAppStore';
import StatCard from '../components/shared/StatCard';
import type { ContactMessage, AdminUser } from '../types';

export default function AdminPanel() {
  const { user, settings } = useAppStore();

  const [activeTab, setActiveTab] = useState<'premium' | 'messages' | 'stats'>('premium');
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState('');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState({ usersCount: 0, logsCount: 0, remindersCount: 0 });

  // Çifte Güvenlik Duvarı
  if (!user || (user.email !== 'm3rt7132@gmail.com' && settings?.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  const fetchData = async () => {
    setIsLoading(true);

    // 1. Kullanıcı ve Premium Listesini Çek
    const { data: userData } = await supabase.rpc('get_admin_user_list');
    if (userData) setUsers(userData);

    // 2. Mesajları Çek (RLS Bypass RPC ile)
    const { data: msgData } = await supabase.rpc('get_admin_messages');
    if (msgData) setMessages(msgData);

    // 3. İstatistikleri Çek (RLS Bypass RPC ile)
    const { data: statData } = await supabase.rpc('get_admin_stats');
    if (statData) setStats(statData);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- PREMİUM YÖNETİMİ ---
  const handleGrantPremium = async (userId: string, monthsToAdd: number) => {
    let newDate = new Date();
    if (monthsToAdd === 999) {
      newDate = new Date('2099-12-31'); // Sınırsız
    } else if (monthsToAdd === 0) {
      newDate = new Date(0); // Yetki İptali / Üyelik Silme
    } else {
      newDate.setMonth(newDate.getMonth() + monthsToAdd); // X Ay Ekle
    }

    const premiumUntilStr = monthsToAdd === 0 ? null : newDate.toISOString();

    const { error } = await supabase
      .from('user_settings')
      .update({ premium_until: premiumUntilStr })
      .eq('user_id', userId);

    if (error) {
      setActionFeedback('Hata: ' + error.message);
    } else {
      setActionFeedback(monthsToAdd === 0 ? 'Kullanıcının premium üyeliği silindi.' : 'Premium yetkisi başarıyla verildi!');
      fetchData();
    }

    setTimeout(() => setActionFeedback(''), 3000);
  };

  // --- MESAJ YÖNETİMİ ---
  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    await supabase.rpc('delete_admin_message', { msg_id: id });
    fetchData();
  };

  // --- KULLANICI HESABINI TAMAMEN SİLME ---
  const handleDeleteAccount = async (id: string, email: string) => {
    if (!window.confirm(`${email} e-posta adresli kullanıcının hesabını (ve tüm verilerini) KALICI OLARAK silmek istediğinize emin misiniz?`)) return;

    const { error } = await supabase.rpc('delete_user_account', { target_user_id: id });

    if (error) {
      setActionFeedback('Hata: ' + error.message);
    } else {
      setActionFeedback('Kullanıcı hesabı sistemden tamamen silindi.');
      fetchData(); // Listeyi yenile
    }
    setTimeout(() => setActionFeedback(''), 3000);
  };

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10">

      {/* BAŞLIK KARTI */}
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
        <div className="tabs tabs-boxed bg-[#16191d] p-1 border border-base-300 flex-wrap">
          <a
            className={`tab tab-lg ${activeTab === 'premium' ? 'bg-emerald-600 text-white font-bold' : 'text-base-content/60 hover:text-white'}`}
            onClick={() => setActiveTab('premium')}
          >
            Premium Yönetimi
          </a>
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
            İstatistikler
          </a>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-emerald-500"></span></div>
        ) : (
          <>
            {/* 1. PREMİUM YÖNETİMİ SEKME İÇERİĞİ */}
            {activeTab === 'premium' && (
              <div className="w-full bg-[#16191d] rounded-xl shadow-2xl border border-base-300 overflow-hidden px-2 sm:px-0">

                {actionFeedback && (
                  <div className="bg-emerald-900/50 border-b border-emerald-500/30 p-4 text-emerald-400 font-bold text-center">
                    {actionFeedback}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="table w-full text-left">
                    <thead className="bg-[#1e2329] text-base-content/70">
                      <tr>
                        <th className="py-4 px-4">Kullanıcı (E-posta)</th>
                        <th>Rol</th>
                        <th>Premium Durumu</th>
                        <th className="text-right px-4">Aksiyonlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const isPremium = u.premium_until && new Date(u.premium_until) > new Date();
                        const premiumDate = isPremium ? new Date(u.premium_until!).toLocaleDateString('tr-TR') : 'Yok';

                        return (
                          <tr key={u.id} className="border-b border-base-300/50 hover:bg-base-200/50 transition-colors">
                            <td className="py-4 px-4 font-medium">{u.email}</td>
                            <td>
                              {u.role === 'admin' ? (
                                <span className="badge badge-error badge-outline gap-1">Kurucu</span>
                              ) : (
                                <span className="badge badge-ghost text-base-content/50">Üye</span>
                              )}
                            </td>
                            <td>
                              {isPremium ? (
                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                                  {premiumDate}
                                </span>
                              ) : (
                                <span className="text-base-content/30 text-sm">Ücretsiz</span>
                              )}
                            </td>
                            <td className="text-right px-4 space-x-2 whitespace-nowrap">
                              {u.role !== 'admin' && (
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleGrantPremium(u.id, 1)} className="btn btn-sm px-3 bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white border-none">1 Ay Ver</button>
                                  <button onClick={() => handleGrantPremium(u.id, 999)} className="btn btn-sm px-3 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border-none">Sınırsız</button>

                                  {/* Açık Kırmızı: Premium İptali */}
                                  <button onClick={() => handleGrantPremium(u.id, 0)} className="btn btn-sm px-3 bg-red-400/20 text-red-400 hover:bg-red-500 hover:text-white border-none" title="Premium yetkisini geri alır">
                                    Premium İptal
                                  </button>

                                  {/* Koyu Kırmızı ve Çerçeveli: Hesabı Tamamen Sil */}
                                  <button onClick={() => handleDeleteAccount(u.id, u.email)} className="btn btn-sm px-3 bg-red-950/80 text-red-300 hover:bg-red-700 hover:text-white border border-red-800/50 shadow-sm" title="Kullanıcıyı sistemden kalıcı olarak siler">
                                    Hesabı Sil
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="p-8 text-center text-base-content/50">Kayıtlı kullanıcı bulunamadı.</div>
                  )}
                </div>
              </div>
            )}

            {/* 2. MESAJLAR SEKME İÇERİĞİ */}
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
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
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
            )}

            {/* 3. İSTATİSTİKLER SEKME İÇERİĞİ */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                <StatCard title="Aktif Profiller" value={stats.usersCount} desc="Ayarlarını kaydeden tekil kullanıcı sayısı" colorTheme="white" iconName="users" />
                <StatCard title="Girilen Mesailer" value={stats.logsCount} desc="Takvime işlenmiş toplam gün/vardiya" colorTheme="emerald" iconName="calendar" />
                <StatCard title="Hatırlatıcılar" value={stats.remindersCount} desc="Kullanıcıların eklediği toplam not/hatırlatma" colorTheme="orange" iconName="bell" />

                <div className="md:col-span-3 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 mt-4 flex items-start gap-4 shadow-inner">
                  <span className="text-2xl mt-1">💡</span>
                  <div>
                    <h4 className="font-bold text-emerald-400">Yönetici Notu</h4>
                    <p className="text-sm text-base-content/70 mt-1">
                      Kullanıcıların şifreleri, e-posta adresleri ve kimlik doğrulama ayarları güvenliğiniz gereği sadece <strong className="text-white">Supabase Dashboard</strong> üzerinden yönetilebilir. Ön yüzden sadece kullanıcı davranışlarını, mesajları ve premium yetkilerini takip edebilirsiniz.
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