import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useShiftCalculator } from '../../hooks/useShiftCalculator';
import { supabase } from '../../lib/supabaseClient';
import { useAppStore } from '../../store/useAppStore';

import Navbar from './Navbar';
import Sidebar from './SidebarMobile';
import Footer from './Footer';

export default function MainLayout() {
  const shiftContext = useShiftCalculator();
  const { user, setUser, setSession, setSettings } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async (userId: string) => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data) setSettings(data);
      else console.error("Ayarlar çekilemedi:", error);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchSettings(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) fetchSettings(session.user.id);
      else setSettings(null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setSettings]);

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
        <Navbar user={user} isFounder={isFounder} onLogout={handleLogout} />

        <div className="w-full max-w-5xl px-4 pb-12 flex flex-col items-center flex-grow">
          <Outlet context={shiftContext} />
        </div>

        <Footer />
      </div>

      <Sidebar user={user} isFounder={isFounder} onLogout={handleLogout} onClose={closeDrawer} />
    </div>
  );
}