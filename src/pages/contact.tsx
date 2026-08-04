import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';

export default function Contact() {
  const { user } = useAppStore();

  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [topic, setTopic] = useState('Öneri / Yeni Fikir');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Eğer kullanıcı giriş yapmışsa adını otomatik doldur
  useEffect(() => {
    if (user?.user_metadata?.name) {
      setName(user.user_metadata.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactInfo || !message) return;

    setIsSubmitting(true);
    setFeedback(null);

    const { error } = await supabase.from('contact_messages').insert({
      user_id: user?.id || null, // Giriş yapmamışsa null gider
      name,
      contact_info: contactInfo,
      topic,
      message
    });

    if (!error) {
      setFeedback({ type: 'success', message: 'Mesajınız başarıyla iletildi! En kısa sürede dönüş yapacağım.' });
      setMessage(''); // Mesaj kutusunu temizle, diğerlerini bırakabiliriz
    } else {
      setFeedback({ type: 'error', message: 'Bir hata oluştu: ' + error.message });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10">

      {/* ÜST BAŞLIK VE BİLGİLENDİRME */}
      <div className="w-full max-w-4xl mb-8 px-2">
        <div className="bg-gradient-to-r from-indigo-900/40 to-[#16191d] border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-3">İletişim & Destek</h2>
            <p className="text-base-content/80 text-lg leading-relaxed max-w-2xl">
              Vardiyo, dev bir şirket değil; tamamen <strong className="text-indigo-400">tek kişilik bir tutku projesidir.</strong>
              <br className="hidden sm:block" /> Sistemle ilgili bir hata mı buldunuz? Yeni bir özellik fikriniz mi var? Yoksa sadece selam mı vermek istiyorsunuz?
            </p>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 font-medium bg-emerald-900/20 w-fit px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Gönderdiğiniz her mesajı bizzat okuyor ve hızlıca dönüş yapıyorum.
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 px-2">

        {/* İLETİŞİM FORMU (SOL TARAF - GENİŞ) */}
        <div className="md:col-span-2 bg-[#16191d] rounded-2xl shadow-2xl border border-base-300 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {feedback && (
              <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${feedback.type === 'success' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'}`}>
                {feedback.type === 'success' ? '🚀' : '⚠️'} {feedback.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="form-control w-full">
                <label className="label pb-1"><span className="label-text font-bold text-base-content/80">İsminiz</span></label>
                <input
                  type="text"
                  placeholder="Size nasıl hitap edeyim?"
                  className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 p-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-1"><span className="label-text font-bold text-base-content/80">İletişim Adresiniz</span></label>
                <input
                  type="text"
                  placeholder="E-posta, Telefon veya Instagram hesabı"
                  className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 p-3"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label pb-1"><span className="label-text font-bold text-base-content/80">Konu</span></label>
              <select
                className="select select-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 font-medium p-3"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="Öneri / Yeni Fikir">💡 Öneri / Yeni Fikir</option>
                <option value="Hata Bildirimi (Bug)">🐛 Hata Bildirimi (Bug)</option>
                <option value="Destek Talebi">🆘 Destek Talebi</option>
                <option value="Diğer">💬 Diğer</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label pb-1"><span className="label-text font-bold text-base-content/80">Mesajınız</span></label>
              <textarea
                className="textarea textarea-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 min-h-[150px]text-base p-3"
                placeholder="Neler düşünüyorsunuz? Tüm detaylarıyla yazabilirsiniz..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-900/40 text-lg mt-2 h-14 p-3"
            >
              {isSubmitting ? <span className="loading loading-spinner"></span> : 'Mesajı Gönder'}
            </button>
          </form>
        </div>

        {/* DİĞER İLETİŞİM YOLLARI (SAĞ TARAF - DAR) */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#1e2329] rounded-2xl border border-pink-500/70 p-6 shadow-lg flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-pink-900/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
           
            <h3 className="font-bold text-base-content mb-1">Daha Hızlı Ulaşın</h3>
            <p className="text-sm text-base-content/60 mb-4">Eğer form doldurmak istemiyorsanız, bana doğrudan Instagram üzerinden DM atabilirsiniz.</p>
            <a
              href="https://instagram.com/merutou"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline hover:bg-pink-600 hover:text-white hover:border-pink-600 border-base-300 w-full"
            >
              @merutou Instagram
            </a>
          </div>

          <div className="bg-[#1e2329] rounded-2xl border border-indigo-400/70 p-6 shadow-lg">
            <h3 className="font-bold text-base-content mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sıkça Sorulan
            </h3>
            <div className="text-sm text-base-content/70 space-y-3">
              <p><strong>Verilerim güvende mi?</strong><br />Girdiğiniz iletişim bilgileri hiçbir kurum veya kuruluşla paylaşılmaz.</p>
              <p><strong>Ne zaman cevap alırım?</strong><br />Kısa sürede cevap verilir.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}