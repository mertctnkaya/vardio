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
        <div className="tabs tabs-boxed bg-[#16191d] p-1 border border-base-300 flex-wrap justify-center sm:justify-start">
          <button className={`tab tab-lg ${activeTab === 'payroll' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('payroll')}>Aylık Bordro</button>
          <button className={`tab tab-lg ${activeTab === 'annual_leave' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('annual_leave')}>Yıllık İzin</button>
          <button className={`tab tab-lg ${activeTab === 'tazminat' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('tazminat')}>Tazminat Hesapla</button>
          <button className={`tab tab-lg ${activeTab === 'hourly' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('hourly')}>Saatlikten Bul</button>
          <button className={`tab tab-lg ${activeTab === 'tools' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('tools')}>Araçlar (Aylıktan)</button>
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