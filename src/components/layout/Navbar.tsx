import { Link } from 'react-router-dom';
import NotificationDropdown from '../shared/NotificationDropdown';
import type { NavbarProps } from '../../types';

export default function Navbar({ user, isFounder, onLogout }: NavbarProps) {
  return (
    <div className="navbar bg-base-100 shadow-xl mb-6 sm:mb-8 w-full z-10 px-2 sm:px-4 print:hidden">
      <div className="navbar-start">
        <label htmlFor="mobile-drawer" className="btn btn-ghost lg:hidden cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </label>
        <Link to="/" className="btn btn-ghost text-xl text-indigo-500 font-black tracking-wide ml-1 lg:ml-0">
          Vardiyo
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-medium text-base-content gap-1 items-center">
          <li><Link to="/" className="hover:text-indigo-400 focus:bg-indigo-500/10 focus:text-indigo-400 rounded-lg">Güncel Vardiya</Link></li>
          <li><Link to="/worktime" className="hover:text-indigo-400 focus:bg-indigo-500/10 focus:text-indigo-400 rounded-lg">Mesai Takvimim</Link></li>
          <li><Link to="/next-weeks" className="hover:text-indigo-400 focus:bg-indigo-500/10 focus:text-indigo-400 rounded-lg">Gelecek Haftalar</Link></li>
          <li><Link to="/calculations" className="hover:text-indigo-400 focus:bg-indigo-500/10 focus:text-indigo-400 rounded-lg">Hesaplamalar&İşlemler</Link></li>
          <li><Link to="/faq" className="hover:text-indigo-400 focus:bg-indigo-500/10 focus:text-indigo-400 rounded-lg">S.S.S & Haklar</Link></li>
          <li><Link to="/contact" className="hover:text-indigo-400 focus:bg-indigo-500/10 focus:text-indigo-400 rounded-lg">İletişim</Link></li>
          <li><Link to="/settings" className="hover:text-indigo-400 focus:bg-indigo-500/10 focus:text-indigo-400 rounded-lg">Ayarlar</Link></li>

          {isFounder && (
            <li className="ml-2">
              <Link to="/admin" className="hover:text-emerald-300 focus:bg-emerald-500/20 text-emerald-400 font-bold bg-emerald-900/10 border border-emerald-500/20 rounded-lg shadow-inner">
                👑 Yönetici
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="navbar-end hidden lg:flex gap-3 pr-2">
        {user ? (
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <span className="text-sm font-semibold text-base-content/80 border border-base-300 bg-base-200 px-3 py-1.5 rounded-full">
              {user.user_metadata?.name}
            </span>
            <button onClick={onLogout} className="btn btn-sm btn-outline hover:bg-red-600 hover:text-white border-red-500/30 text-red-400 transition-colors">
              Çıkış
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm text-base-content hover:bg-base-200">Giriş Yap</Link>
            <Link to="/register" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none transition-colors shadow-lg shadow-indigo-900/50">
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </div>
  );
}