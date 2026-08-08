import { useState, useMemo } from 'react';
import { FAQ_DATA, THEMES } from '../../constants/faqData';

export default function FaqTab() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_DATA;
    const lowerQ = searchQuery.toLowerCase();

    return FAQ_DATA.map(category => {
      const filteredQuestions = category.faqs.filter(
        faq => faq.q.toLowerCase().includes(lowerQ) || faq.a.toLowerCase().includes(lowerQ)
      );
      return { ...category, faqs: filteredQuestions };
    }).filter(cat => cat.faqs.length > 0);
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-base-300 pb-6">
        <div>
          <h3 className="text-xl font-bold text-indigo-400">Sıkça Sorulan Sorular</h3>
          <p className="text-sm text-base-content/60 mt-1">İş Kanunu, SGK ve İŞKUR hakkında merak ettiklerinizi arayın.</p>
        </div>
        <div className="w-full sm:w-80 relative group">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400 group-focus-within:text-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            className="input input-bordered w-full bg-base-200/80 pl-10 focus:ring-2 focus:ring-indigo-500 border-indigo-500/30"
            placeholder="Örn: Kıdem, Rapor, Mesai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-xl border border-base-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-base-content/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-base-content/60">Aradığınız kelimeye ait bir soru bulunamadı.</p>
        </div>
      ) : (
        filteredFaqs.map((category, catIndex) => {
          const theme = THEMES[catIndex % THEMES.length];

          return (
            <div key={catIndex} className="mb-8">
              <h4 className={`font-bold uppercase tracking-wider text-xs mb-3 ml-2 flex items-center gap-2 ${theme.text}`}>
                <span className={`w-2 h-2 rounded-full ${theme.iconBg.replace('/10', '')}`}></span>
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.faqs.map((faq, faqIndex) => (
                  <div key={faqIndex} className={`collapse collapse-arrow bg-base-200 border border-base-300 shadow-sm transition-all duration-300 ${theme.borderHover}`}>
                    <input type="checkbox" className="peer" />
                    <div className="collapse-title text-base sm:text-md font-bold text-base-content/90 flex items-center gap-3 pr-10 peer-checked:text-base-content">
                      <span className={`${theme.text} ${theme.iconBg} p-1.5 rounded-lg shrink-0`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      </span>
                      {faq.q}
                    </div>
                    <div className="collapse-content text-sm text-base-content/70 leading-relaxed bg-[#1e2329] pt-4 border-t border-base-300">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  );
}