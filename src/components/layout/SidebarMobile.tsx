import { Link, useNavigate } from 'react-router-dom';
import type { SidebarProps } from '../../types';

export default function Sidebar({ user, isFounder, onLogout, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleMobileNotificationClick = () => {
    onClose()
    navigate('/settings') // Mobilde bildirim merkezi için ileride özel bir sayfa/modal yapılabilir
  };

  return (
    <div className="drawer-side z-50">
      <label htmlFor="mobile-drawer" aria-label="close sidebar" className="drawer-overlay backdrop-blur-sm bg-black/40"></label>
      <ul className="menu p-6 w-[80vw] max-w-sm min-h-full bg-base-100 text-base-content gap-2 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
          <span className="text-2xl font-black text-indigo-500 tracking-wide">Vardiyo</span>
          <label htmlFor="mobile-drawer" className="btn btn-square btn-ghost btn-sm text-base-content/60 hover:text-base-content">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </label>
        </div>

        {/* MOBİL BİLDİRİMLER BUTONU */}
        {user && (
          <li className="sm:hidden mb-2">
            <button 
              className="flex justify-between items-center text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400"
              onClick={handleMobileNotificationClick}
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Bildirimler
              </div>
              <span className="badge badge-sm badge-error text-white font-bold border-none shadow-sm">2</span>
            </button>
          </li>
        )}

        <li><Link to="/" onClick={onClose} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Güncel Vardiya</Link></li>
        <li><Link to="/worktime" onClick={onClose} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Mesai Takvimim</Link></li>
        <li><Link to="/next-weeks" onClick={onClose} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Gelecek Haftalar</Link></li>
        <li><Link to="/calculations" onClick={onClose} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Hesaplamalar&İşlemler</Link></li>
        <li><Link to="/faq" onClick={onClose} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">S.S.S & Haklar</Link></li>
        <li><Link to="/contact" onClick={onClose} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">İletişim</Link></li>
        <li><Link to="/settings" onClick={onClose} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Ayarlar</Link></li>

        {isFounder && (
          <div className="mt-2">
            <li>
              <Link to="/admin" onClick={onClose} className="text-lg py-3.5 font-bold text-emerald-400 bg-emerald-900/10 border border-emerald-500/20 hover:bg-emerald-900/30 rounded-xl shadow-inner flex items-center justify-between">
                👑 Yönetici Paneli
                <span className="badge badge-sm badge-success border-none">Gizli</span>
              </Link>
            </li>
          </div>
        )}

        <div className="divider mt-4 mb-2"></div>

        {user ? (
          <div className="mt-auto flex flex-col gap-4 pb-4">
            <div className="bg-[#1e2329] p-5 rounded-2xl text-center border border-base-300">
              <p className="text-xs text-base-content/50 uppercase font-bold tracking-widest mb-1.5">KULLANICI</p>
              <p className="font-bold text-indigo-400 text-xl">{user.user_metadata?.name}</p>
            </div>
            <button onClick={onLogout} className="btn bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white border-none w-full shadow-sm rounded-xl text-lg h-12">Çıkış Yap</button>
          </div>
        ) : (
          <div className="mt-auto flex flex-col gap-3 pb-4">
            <Link to="/login" onClick={onClose} className="btn btn-outline border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 w-full rounded-xl text-lg h-12">Giriş Yap</Link>
            <Link to="/register" onClick={onClose} className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none w-full shadow-lg shadow-indigo-900/40 rounded-xl text-lg h-12">Kayıt Ol</Link>
          </div>
        )}
      </ul>
    </div>
  );
}