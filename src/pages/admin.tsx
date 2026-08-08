import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store/useAppStore';
import type { ContactMessage, AdminUser } from '../types';

import AdminHeader from '../components/admin/AdminHeader';
import PremiumTab from '../components/admin/PremiumTab';
import MessagesTab from '../components/admin/MessagesTab';
import StatsTab from '../components/admin/StatsTab';
import BroadcastTab from '../components/admin/BroadcastTab';

export default function AdminPanel() {
  const { user, settings } = useAppStore();

  const [activeTab, setActiveTab] = useState<'premium' | 'messages' | 'stats' | 'broadcast'>('premium');
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState('');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState({ usersCount: 0, logsCount: 0, remindersCount: 0 });

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      alert("Lütfen başlık ve mesaj girin.");
      return;
    }

    setIsBroadcasting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-broadcast', {
        body: { title: broadcastTitle, message: broadcastMessage }
      });

      if (error) throw error;
      
      alert(`Duyuru başarıyla gönderildi! (${data.sentCount} kişiye ulaştı)`);
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err) {
      console.error("Duyuru gönderilemedi:", err);
      alert("Gönderim sırasında bir hata oluştu.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!user || (user.email !== 'm3rt7132@gmail.com' && settings?.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  const fetchData = async () => {
    setIsLoading(true);
    const { data: userData } = await supabase.rpc('get_admin_user_list');
    if (userData) setUsers(userData);

    const { data: msgData } = await supabase.rpc('get_admin_messages');
    if (msgData) setMessages(msgData);

    const { data: statData } = await supabase.rpc('get_admin_stats');
    if (statData) setStats(statData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // OPTIMISTIC UI: Bekleme yapmadan anında (tak tak) çalışan Premium Motoru
  const handleGrantPremium = async (userId: string, monthsToAdd: number) => {
    const targetUser = users.find(u => u.id === userId);
    
    let baseDate = new Date();
    if (monthsToAdd === 999) {
      baseDate = new Date('2099-12-31');
    } else if (monthsToAdd === 0) {
      baseDate = new Date(0);
    } else {
      if (targetUser?.premium_until && new Date(targetUser.premium_until) > baseDate) {
        baseDate = new Date(targetUser.premium_until);
      }
      baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
    }

    const premiumUntilStr = monthsToAdd === 0 ? null : baseDate.toISOString();

    // 1. Ekrandaki veriyi saniyesinde değiştir (Kullanıcı beklemez, tablo kaymaz)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, premium_until: premiumUntilStr } : u));
    
    // 2. Arka planda veritabanını sessizce güncelle
    const { error } = await supabase
      .from('user_settings')
      .update({ premium_until: premiumUntilStr })
      .eq('user_id', userId);

    // 3. SADECE HATA VARSA UYARI VER VE TABLOYU GERİ AL
    if (error) {
      setActionFeedback('Hata: ' + error.message);
      setTimeout(() => setActionFeedback(''), 3000);
      fetchData(); // Hata durumunda tabloyu eski gerçek haline döndür
    }
  };

  // OPTIMISTIC UI: Anında silinen mesajlar
  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    
    // Anında ekrandan uçur
    setMessages(prev => prev.filter(m => m.id !== id));
    
    // Arka planda DB'den sil
    const { error } = await supabase.rpc('delete_admin_message', { msg_id: id });
    if (error) {
      setActionFeedback('Hata: ' + error.message);
      setTimeout(() => setActionFeedback(''), 3000);
      fetchData(); 
    }
  };

  // OPTIMISTIC UI: Anında silinen hesaplar
  const handleDeleteAccount = async (id: string, email: string) => {
    if (!window.confirm(`${email} e-posta adresli kullanıcının hesabını (ve tüm verilerini) KALICI OLARAK silmek istediğinize emin misiniz?`)) return;
    
    // Anında ekrandan uçur (Tablo kayması olmaz, anında silinir)
    setUsers(prev => prev.filter(u => u.id !== id));

    // Arka planda DB'den sil
    const { error } = await supabase.rpc('delete_user_account', { target_user_id: id });
    if (error) {
      setActionFeedback('Hata: ' + error.message);
      setTimeout(() => setActionFeedback(''), 3000);
      fetchData(); 
    }
  };

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10">
      
      <AdminHeader email={user.email || ''} />

      <div className="w-full max-w-5xl px-2 mb-6">
        <div className="tabs tabs-boxed bg-[#16191d] p-1 border border-base-300 flex-wrap justify-center sm:justify-start gap-1">
          <a
            className={`tab tab-lg rounded-lg transition-all ${activeTab === 'premium' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('premium')}
          >
            Premium Yönetimi
          </a>
          <a
            className={`tab tab-lg rounded-lg transition-all ${activeTab === 'messages' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('messages')}
          >
            Gelen Mesajlar ({messages.length})
          </a>
          <a
            className={`tab tab-lg rounded-lg transition-all ${activeTab === 'stats' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('stats')}
          >
            İstatistikler
          </a>
          <a
            className={`tab tab-lg rounded-lg transition-all ${activeTab === 'broadcast' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('broadcast')}
          >
            Duyuru Yayınla
          </a>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        {isLoading ? (
          <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-emerald-500"></span></div>
        ) : (
          <>
            {activeTab === 'premium' && (
              <PremiumTab 
                users={users} 
                actionFeedback={actionFeedback} 
                onGrantPremium={handleGrantPremium} 
                onDeleteAccount={handleDeleteAccount} 
              />
            )}
            
            {activeTab === 'messages' && (
              <MessagesTab 
                messages={messages} 
                onDeleteMessage={handleDeleteMessage} 
              />
            )}
            
            {activeTab === 'stats' && <StatsTab stats={stats} />}
            
            {activeTab === 'broadcast' && (
              <BroadcastTab 
                title={broadcastTitle}
                message={broadcastMessage}
                isBroadcasting={isBroadcasting}
                onTitleChange={setBroadcastTitle}
                onMessageChange={setBroadcastMessage}
                onSend={handleSendBroadcast}
              />
            )}
          </>
        )}
      </div>

    </div>
  );
}