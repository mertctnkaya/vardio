export default function ContactSidebar() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#1e2329] rounded-2xl border border-pink-500/70 p-6 shadow-lg flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-pink-900/20 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </div>
        
        <h3 className="font-bold text-base-content mb-1">Daha Hızlı Ulaşın</h3>
        <p className="text-sm text-base-content/60 mb-4">Eğer form doldurmak istemiyorsanız, bana doğrudan Instagram üzerinden DM atabilirsiniz.</p>
        <a
          href="https://instagram.com/merutou"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline hover:bg-pink-600 hover:text-white hover:border-pink-600 border-base-300 w-full"
        >
          @merutou Instagram
        </a>
      </div>

      <div className="bg-[#1e2329] rounded-2xl border border-indigo-400/70 p-6 shadow-lg">
        <h3 className="font-bold text-base-content mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Sıkça Sorulan
        </h3>
        <div className="text-sm text-base-content/70 space-y-3">
          <p><strong>Verilerim güvende mi?</strong><br />Girdiğiniz iletişim bilgileri hiçbir kurum veya kuruluşla paylaşılmaz.</p>
          <p><strong>Ne zaman cevap alırım?</strong><br />Kısa sürede cevap verilir.</p>
        </div>
      </div>
    </div>
  );
}