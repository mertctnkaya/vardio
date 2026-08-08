import { Link } from 'react-router-dom';
import type { GuestPromoCardProps } from '../../types/currentShift';

export default function GuestPromoCard({ user }: GuestPromoCardProps) {
  if (user) return null;

  return (
    <div className="md:col-span-2 mt-2 bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
      <h3 className="text-xl sm:text-2xl font-bold text-indigo-400 mb-2">Kendinize Göre Özelleştirin</h3>
      <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
        Şu an örnek bir vardiya döngüsünü görüntülüyorsunuz. Kendi işe başlama tarihinizi, yevmiye ayarlarınızı ve devamsızlık durumlarınızı kaydedip otomatik bordro hesabı yaptırmak için ücretsiz hesap oluşturun.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link to="/login" className="btn btn-outline border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-white">Giriş Yap</Link>
        <Link to="/register" className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none">Hemen Kayıt Ol</Link>
      </div>
    </div>
  );
}