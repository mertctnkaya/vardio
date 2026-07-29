import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store/useAppStore';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();
  const { user } = useAppStore();

  useEffect(() => {
    // GÜVENLİK VE UX KONTROLÜ: 
    // Kullanıcı url'ye elle mi yazdı, yoksa e-postadaki linkten mi geldi?
    // E-postadan gelen linklerin URL'sinde "#access_token=" veya "type=recovery" gibi gizli hash'ler olur.
    // Eğer kullanıcı giriş yapmamışsa VE url'de o gizli şifreler yoksa, kapı dışarı et!
    const hash = window.location.hash;
    if (!user && !hash.includes('access_token') && !hash.includes('recovery')) {
      navigate('/login');
      return;
    }

    // Supabase şifre sıfırlama işlemi için kullanıcıyı bu sayfaya otomatik oturum açmış olarak yönlendirir.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Kurtarma modundayız, her şey yolunda.
      }
    });
    
    return () => authListener.subscription.unsubscribe();
  }, [user, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setMessage(null);

    // Oturum açmış olan kullanıcının şifresini güncelliyoruz
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: 'Hata: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz...' });
      setTimeout(() => {
        // İşlem bitince Supabase oturumunu tamamen kapatıp giriş ekranına atıyoruz
        supabase.auth.signOut().then(() => {
          navigate('/login');
        });
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in w-full pb-10 pt-10">
      <div className="w-full max-w-md bg-[#16191d] rounded-2xl shadow-2xl border border-base-300 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Yeni Şifre Belirle</h2>
          <p className="text-base-content/60 text-sm">Lütfen hesabınız için kullanacağınız yeni şifrenizi girin.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'}`}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold text-base-content/80">Yeni Şifre</span></label>
            <input 
              type="password" 
              placeholder="En az 6 karakter" 
              className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/40 mt-4 h-12"
          >
            {loading ? <span className="loading loading-spinner"></span> : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}