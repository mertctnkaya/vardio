import Icon from './Icon';
import type { IconName, AlertProps } from '../../types';  

export default function Alert({
  color,
  title,
  children,
  className = '',
  bgStyle = 'colored',
  borderStyle = 'colored',
  icon,
  titleColored = true,
}: AlertProps) {

  // Tema Renk Sözlüğü (Struct Map)
  const colorMap = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-900/10', border: 'border-emerald-500/30', borderLeft: 'border-emerald-500', defaultIcon: 'check' },
    red: { text: 'text-red-400', bg: 'bg-red-900/10', border: 'border-red-500/50', borderLeft: 'border-red-500', defaultIcon: 'warning' },
    amber: { text: 'text-amber-500', bg: 'bg-amber-900/10', border: 'border-amber-500/30', borderLeft: 'border-amber-500', defaultIcon: 'warning' },
    sky: { text: 'text-sky-400', bg: 'bg-sky-900/10', border: 'border-sky-500/30', borderLeft: 'border-sky-500', defaultIcon: 'info' },
    pink: { text: 'text-pink-400', bg: 'bg-pink-900/10', border: 'border-pink-500/30', borderLeft: 'border-pink-500', defaultIcon: 'info' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-900/10', border: 'border-yellow-500/30', borderLeft: 'border-yellow-500', defaultIcon: 'warning' },
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-900/10', border: 'border-indigo-500/30', borderLeft: 'border-indigo-500', defaultIcon: 'info' },
    gray: { text: 'text-base-content', bg: 'bg-base-200/50', border: 'border-base-300', borderLeft: 'border-base-content/50', defaultIcon: 'info' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-900/10', border: 'border-violet-500/30', borderLeft: 'border-violet-500', defaultIcon: 'info' },
  };

  const theme = colorMap[color];

  // 1. Arka plan CSS'i
  let bgClass = '';
  if (bgStyle === 'colored') bgClass = theme.bg;
  else if (bgStyle === 'base') bgClass = 'bg-[#16191d]'; // SS'teki karanlık kart arkaplanı
  else if (bgStyle === 'transparent') bgClass = 'bg-transparent';

  // 2. Çerçeve CSS'i
  let borderClass = '';
  if (borderStyle === 'colored') borderClass = `border ${theme.border}`;
  else if (borderStyle === 'left-colored') borderClass = `border-l-2 ${theme.borderLeft}  border-base-300`;
  else if (borderStyle === 'base') borderClass = 'border border-base-300';

  // 3. İkon Mantığı
  const finalIcon = icon === undefined ? theme.defaultIcon : icon;
  const showIcon = finalIcon !== 'none';

  // 4. Başlık Rengi
  const titleClass = titleColored ? theme.text : 'text-base-content/90';

  return (
    <div className={`p-5 rounded-xl flex items-start gap-4 transition-colors ${bgClass} ${borderClass} ${className}`}>
      {showIcon && (
        <div className={`shrink-0 mt-0.5 ${theme.text}`}>
           <Icon name={finalIcon as IconName} className="w-6 h-6" />
        </div>
      )}
      <div className="flex-1">
        {title && <h4 className={`font-bold mb-2 ${titleClass}`}>{title}</h4>}
        <div className="text-sm text-base-content/70 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}