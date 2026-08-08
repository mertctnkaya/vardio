import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabaseClient';

export default function ContactForm() {
  const { user } = useAppStore();

  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [topic, setTopic] = useState('Öneri / Yeni Fikir');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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
      user_id: user?.id || null,
      name,
      contact_info: contactInfo,
      topic,
      message
    });

    if (!error) {
      setFeedback({ type: 'success', message: 'Mesajınız başarıyla iletildi! En kısa sürede dönüş yapacağım.' });
      setMessage('');
    } else {
      setFeedback({ type: 'error', message: 'Bir hata oluştu: ' + error.message });
    }

    setIsSubmitting(false);
  };

  return (
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
  );
}