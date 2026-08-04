import type { StatCardProps } from '../../types';
import Icon from './Icon';

export default function StatCard({ title, value, desc, colorTheme = 'emerald', iconName }: StatCardProps) {
  // Tailwind sınıflarını dinamik verebilmek için map yapısı kullanıyoruz
  const themeMap = {
    white: { text: 'text-white', glow: 'bg-white/10' },
    blue: { text: 'text-blue-400', glow: 'bg-blue-500/10' },
    emerald: { text: 'text-emerald-400', glow: 'bg-emerald-500/10' },
    orange: { text: 'text-orange-400', glow: 'bg-orange-500/10' },
    rose: { text: 'text-rose-400', glow: 'bg-rose-500/10' },
    indigo: { text: 'text-indigo-400', glow: 'bg-indigo-500/10' },
    gray: { text: 'text-base-content/50', glow: 'bg-base-300/20' }
  };

  const theme = themeMap[colorTheme];

  return (
    <div className="bg-[#16191d] rounded-2xl border border-base-300 p-8 shadow-lg text-center relative overflow-hidden flex flex-col items-center justify-center">
      {/* Sağ üstteki parlayan küre */}
      <div className={`absolute top-0 right-0 p-16 rounded-full blur-3xl -mr-10 -mt-10 ${theme.glow}`}></div>
      
      {/* Varsa İkon */}
      {iconName && (
        <div className={`mb-3 relative z-10 ${theme.text}`}>
          <Icon name={iconName} className="w-8 h-8 opacity-80" />
        </div>
      )}
      
      <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-widest mb-2 relative z-10">
        {title}
      </h3>
      <p className={`text-5xl font-black relative z-10 ${theme.text}`}>
        {value}
      </p>
      <p className="text-xs text-base-content/40 mt-2 relative z-10">
        {desc}
      </p>
    </div>
  );
}