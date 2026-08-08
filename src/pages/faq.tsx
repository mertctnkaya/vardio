import { useState } from 'react';
import UsageTab from '../components/faq/UsageTab';
import RightsTab from '../components/faq/RightsTab';
import FaqTab from '../components/faq/FaqTab';

export default function FAQ() {
    const [activeTab, setActiveTab] = useState<'usage' | 'rights' | 'faq'>('usage');

    return (
        <div className="flex flex-col items-center animate-fade-in w-full pb-10">

            {/* SAYFA BAŞLIĞI */}
            <div className="w-full max-w-4xl mb-6 px-2 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-base-content">Bilgi & Haklar Rehberi</h2>
                <p className="text-base-content/60 mt-1">Sistemin kullanımı ve İş Kanunu'ndaki temel haklarınız.</p>
            </div>

            {/* SEKMELER (TABS) MENÜSÜ */}
            <div className="w-full max-w-4xl px-2 mb-6">
                <div className="tabs tabs-boxed bg-[#16191d] p-1 border border-base-300 flex-wrap justify-center sm:justify-start gap-1">
                    <a className={`tab tab-lg rounded-lg transition-all ${activeTab === 'usage' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('usage')}>Sistem Kullanımı</a>
                    <a className={`tab tab-lg rounded-lg transition-all ${activeTab === 'rights' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('rights')}>İşçi Hakları (Yasal)</a>
                    <a className={`tab tab-lg rounded-lg transition-all ${activeTab === 'faq' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-base-content/60 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('faq')}>S.S.S.</a>
                </div>
            </div>

            <div className="w-full max-w-4xl bg-[#16191d] rounded-xl shadow-2xl border border-base-300 p-6 sm:p-8 animate-fade-in">
                {activeTab === 'usage' && <UsageTab />}
                {activeTab === 'rights' && <RightsTab />}
                {activeTab === 'faq' && <FaqTab />}
            </div>

        </div>
    );
}