import type { AdminHeaderProps } from '../../types';

export default function AdminHeader({ email }: AdminHeaderProps) {
  return (
    <div className="w-full max-w-5xl mb-6 px-2">
      <div className="bg-gradient-to-r from-emerald-900/40 to-[#16191d] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            👑 Yönetim Paneli
          </h2>
          <p className="text-emerald-400/80 text-lg mt-1 font-medium">
            Sistem senindir.
          </p>
        </div>
        <div className="hidden sm:block relative z-10 text-right">
          <p className="text-xs text-base-content/50 uppercase font-bold tracking-widest">YETKİLİ HESAP</p>
          <p className="font-bold text-emerald-400">{email}</p>
        </div>
      </div>
    </div>
  );
}