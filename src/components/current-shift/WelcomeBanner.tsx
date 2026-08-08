import { Link } from 'react-router-dom';
import type { WelcomeBannerProps } from '../../types/currentShift';

export default function WelcomeBanner({ showWelcome, onClose }: WelcomeBannerProps) {
  if (!showWelcome) return null;

  return (
    <div className="md:col-span-2 mt-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in relative">
      {/* Kapatma (Bir Daha Gösterme) Butonu */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-base-content"
        title="Bir daha gösterme"
      >✕</button>

      <div className="text-4xl bg-indigo-900/30 p-2 rounded-full hidden sm:block">👋</div>
      <div className="flex-1 pr-6">
        <h4 className="font-bold text-indigo-400 text-lg flex items-center gap-2">
          <span className="sm:hidden">👋</span> Hoş Geldiniz! Sisteme Yabancı Mısınız?
        </h4>
        <p className="text-sm text-base-content/70 mt-1">
          Vardiyo'nun nasıl çalıştığını, hesapların nasıl yapıldığını ve siteye nereden başlayacağınızı adım adım öğrenmek ister misiniz?
        </p>
      </div>
      <Link to="/faq" className="btn btn-sm h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white border-none shrink-0 w-full sm:w-auto mt-2 sm:mt-0 shadow-lg shadow-indigo-900/40">
        Kullanım Rehberi &rarr;
      </Link>
    </div>
  );
}