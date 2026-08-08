import { useState } from 'react';
import PayrollTab from '../components/calculations/PayrollTab';
import AnnualLeaveTab from '../components/calculations/AnnualLeaveTab';
import SeveranceTab from '../components/calculations/SeveranceTab';
import HourlyTab from '../components/calculations/HourlyTab';
import MonthlyToolsTab from '../components/calculations/MonthlyToolsTab';

export default function Calculations() {
  const [activeTab, setActiveTab] = useState<'payroll' | 'annual_leave' | 'tazminat' | 'hourly' | 'tools'>('payroll');

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>

      {/* SAYFA BAŞLIĞI */}
      <div className="w-full max-w-5xl mb-6 px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-base-content">Gerçek Bordro Motoru</h2>
          <p className="text-base-content/60 mt-1">Türkiye standartlarında Brüt'ten Net'e kuruşu kuruşuna hesaplama.</p>
        </div>
      </div>

      {/* SEKMELER (TABS) MENÜSÜ */}
      <div className="w-full max-w-5xl px-2 mb-6 print:hidden">
        <div className="tabs tabs-boxed bg-[#16191d] p-1 border border-base-300 flex-wrap justify-center sm:justify-start gap-1">
          <a className={`tab tab-lg rounded-lg transition-all ${activeTab === 'payroll' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('payroll')}>Aylık Bordro</a>
          <a className={`tab tab-lg rounded-lg transition-all ${activeTab === 'annual_leave' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('annual_leave')}>Yıllık İzin</a>
          <a className={`tab tab-lg rounded-lg transition-all ${activeTab === 'tazminat' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('tazminat')}>Tazminat Hesapla</a>
          <a className={`tab tab-lg rounded-lg transition-all ${activeTab === 'hourly' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('hourly')}>Saatlikten Bul</a>
          <a className={`tab tab-lg rounded-lg transition-all ${activeTab === 'tools' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('tools')}>Araçlar (Aylıktan)</a>
        </div>
      </div>

      {/* İÇERİK (MAKRO COMPONENTLER) */}
      <div className="w-full max-w-5xl">
        {activeTab === 'payroll' && <PayrollTab />}
        {activeTab === 'annual_leave' && <AnnualLeaveTab />}
        {activeTab === 'tazminat' && <SeveranceTab />}
        {activeTab === 'hourly' && <HourlyTab />}
        {activeTab === 'tools' && <MonthlyToolsTab />}
      </div>

    </div>
  );
}