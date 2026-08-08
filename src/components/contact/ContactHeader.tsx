export default function ContactHero() {
  return (
    <div className="w-full max-w-4xl mb-8 px-2">
      <div className="bg-gradient-to-r from-indigo-900/40 to-[#16191d] border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-3">İletişim & Destek</h2>
          <p className="text-base-content/80 text-lg leading-relaxed max-w-2xl">
            Vardiyo, dev bir şirket değil; tamamen <strong className="text-indigo-400">tek kişilik bir tutku projesidir.</strong>
            <br className="hidden sm:block" /> Sistemle ilgili bir hata mı buldunuz? Yeni bir özellik fikriniz mi var? Yoksa sadece selam mı vermek istiyorsunuz?
          </p>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 font-medium bg-emerald-900/20 w-fit px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Gönderdiğiniz her mesajı bizzat okuyor ve hızlıca dönüş yapıyorum.
          </div>
        </div>
      </div>
    </div>
  );
}