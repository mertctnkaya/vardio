import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setMessage(null);
    
    // E-postaya şifre sıfırlama linki yolluyoruz ve kullanıcıyı yeni şifre belirleme sayfasına yönlendiriyoruz
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMessage({ type: 'error', text: 'Hata: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.' });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in w-full pb-10 pt-10">
      <div className="w-full max-w-md bg-[#16191d] rounded-2xl shadow-2xl border border-base-300 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Şifremi Unuttum</h2>
          <p className="text-base-content/60 text-sm">Hesabınıza kayıtlı e-posta adresini girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'}`}>
            {message.type === 'success' ? '📨' : '⚠️'} {message.text}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold text-base-content/80">E-posta Adresi</span></label>
            <input 
              type="email" 
              placeholder="ornek@mail.com" 
              className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-900/40 mt-4 h-12"
          >
            {loading ? <span className="loading loading-spinner"></span> : 'Bağlantı Gönder'}
          </button>
        </form>

        <div className="divider my-6 opacity-50"></div>
        <div className="text-center">
          <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline text-sm transition-colors">
            &larr; Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}