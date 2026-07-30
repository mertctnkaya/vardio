import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import { useShiftCalculator } from './hooks/useShiftCalculator';
import { supabase } from './lib/supabaseClient';
import { useAppStore } from './store/useAppStore';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import CurrentShift from './pages/currentShift';
import NextWeeks from './pages/nextWeeks';
import WorktimeCalendar from './pages/worktimeCalendar';
import Settings from './pages/settings';
import Calculations from './pages/calculations';
import Login from './pages/login';
import Register from './pages/register';
import FAQ from './pages/faq';
import Contact from './pages/contact';
import Admin from './pages/admin'; // YENİ: Admin sayfasını import ettik
import ForgotPassword from './pages/forgotPassword';
import UpdatePassword from './pages/updatePassword';

function Layout() {
  const shiftContext = useShiftCalculator();
  const { user, setSession } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserSettings(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserSettings(session.user.id);
      else useAppStore.getState().setSettings(null);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  const loadUserSettings = async (userId: string) => {
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
    if (data) useAppStore.getState().setSettings(data);
  };

  const closeDrawer = () => {
    const drawer = document.getElementById('mobile-drawer') as HTMLInputElement;
    if (drawer) drawer.checked = false;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeDrawer();
    navigate('/login');
  };

  const isFounder = user?.email === 'm3rt7132@gmail.com';

  return (
    <div className="drawer">
      <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen bg-base-300 items-center">
        {/* === ÜST NAVBAR === */}
        <div className="navbar bg-base-100 shadow-xl mb-6 sm:mb-8 w-full z-10 px-2 sm:px-4 print:hidden">
          <div className="navbar-start">
            <label htmlFor="mobile-drawer" className="btn btn-ghost lg:hidden cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </label>
            <Link to="/" className="btn btn-ghost text-xl text-indigo-500 font-black tracking-wide ml-1 lg:ml-0">
              Vardiyake
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

              {/* GİZLİ MASAÜSTÜ ADMİN LİNKİ */}
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
                <span className="text-sm font-semibold text-base-content/80 border border-base-300 bg-base-200 px-3 py-1.5 rounded-full">
                  {user.user_metadata?.name}
                </span>
                <button onClick={handleLogout} className="btn btn-sm btn-outline hover:bg-red-600 hover:text-white border-red-500/30 text-red-400 transition-colors">
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

        {/* === SAYFA İÇERİĞİ (OUTLET) === */}
        <div className="w-full max-w-5xl px-4 pb-12 flex flex-col items-center flex-grow">
          <Outlet context={shiftContext} />
        </div>

        {/* === FOOTER (ALT BİLGİ) ===  */}
        <footer className="w-full bg-[#16191d] border-t border-base-300 py-4 mt-auto z-10 print:hidden">
          <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
            <div className="flex-1 hidden sm:block">
              <Link to="/contact" className="text-sm font-medium text-base-content/50 hover:text-indigo-400 transition-colors">İletişim</Link>
            </div>

            <div className="flex-1 text-left sm:text-center text-sm font-medium text-base-content/50">
              made by <span className="text-indigo-500 font-black tracking-wide">m3rt</span>
            </div>

            <div className="flex-1 flex justify-end">
              <a
                href="https://instagram.com/merutou"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-base-content/50 hover:text-pink-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <span className="text-sm font-semibold tracking-wide">@merutou</span>
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* === MOBİL ÇEKMECE MENÜ (DRAWER SIDEBAR) === */}
      <div className="drawer-side z-50">
        <label htmlFor="mobile-drawer" aria-label="close sidebar" className="drawer-overlay backdrop-blur-sm bg-black/40"></label>
        <ul className="menu p-6 w-[80vw] max-w-sm min-h-full bg-base-100 text-base-content gap-2 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
            <span className="text-2xl font-black text-indigo-500 tracking-wide">Vardiyake</span>
            <label htmlFor="mobile-drawer" className="btn btn-square btn-ghost btn-sm text-base-content/60 hover:text-base-content">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </label>
          </div>

          <li><Link to="/" onClick={closeDrawer} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Güncel Vardiya</Link></li>
          <li><Link to="/worktime" onClick={closeDrawer} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Mesai Takvimim</Link></li>
          <li><Link to="/next-weeks" onClick={closeDrawer} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Gelecek Haftalar</Link></li>
          <li><Link to="/calculations" onClick={closeDrawer} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Hesaplamalar&İşlemler</Link></li>
          <li><Link to="/faq" onClick={closeDrawer} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">S.S.S & Haklar</Link></li>
          <li><Link to="/contact" onClick={closeDrawer} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">İletişim</Link></li>
          <li><Link to="/settings" onClick={closeDrawer} className="text-lg py-3.5 font-medium rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">Ayarlar</Link></li>

          {/* GİZLİ MOBİL ADMİN LİNKİ */}
          {isFounder && (
            <div className="mt-2">
              <li>
                <Link to="/admin" onClick={closeDrawer} className="text-lg py-3.5 font-bold text-emerald-400 bg-emerald-900/10 border border-emerald-500/20 hover:bg-emerald-900/30 rounded-xl shadow-inner flex items-center justify-between">
                  👑 Yönetici Paneli
                  <span className="badge badge-sm badge-success">Gizli</span>
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
              <button onClick={handleLogout} className="btn bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white border-none w-full shadow-sm rounded-xl text-lg h-12">Çıkış Yap</button>
            </div>
          ) : (
            <div className="mt-auto flex flex-col gap-3 pb-4">
              <Link to="/login" onClick={closeDrawer} className="btn btn-outline border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 w-full rounded-xl text-lg h-12">Giriş Yap</Link>
              <Link to="/register" onClick={closeDrawer} className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none w-full shadow-lg shadow-indigo-900/40 rounded-xl text-lg h-12">Kayıt Ol</Link>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CurrentShift />} />
            <Route path="next-weeks" element={<NextWeeks />} />
            <Route path="worktime" element={<WorktimeCalendar />} />
            <Route path="settings" element={<Settings />} />
            <Route path="calculations" element={<Calculations />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="contact" element={<Contact />} />
            <Route path="admin" element={<Admin />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="update-password" element={<UpdatePassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}