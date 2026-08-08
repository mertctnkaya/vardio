import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import MainLayout from './components/layout/MainLayout';
import CurrentShift from './pages/currentShift';
import NextWeeks from './pages/nextWeeks';
import WorktimeCalendar from './pages/worktimeCalendar';
import Settings from './pages/settings';
import Calculations from './pages/calculations';
import Login from './pages/login';
import Register from './pages/register';
import FAQ from './pages/faq';
import Contact from './pages/contact';
import Admin from './pages/admin';
import ForgotPassword from './pages/forgotPassword';
import UpdatePassword from './pages/updatePassword';

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <SpeedInsights />
      <Routes>
        <Route path="/" element={<MainLayout />}>
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
  );
}