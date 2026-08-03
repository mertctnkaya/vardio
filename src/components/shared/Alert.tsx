import type { IconName, AlertProps } from '../../types';
import Icon from './Icon';

export default function Alert({ type, title, children }: AlertProps) {
  // Tiplere göre renk ve ikon sözlüğü
  const config = {
    success: { bg: 'bg-emerald-900/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'check' as IconName },
    error: { bg: 'bg-red-900/10 border-l-4', border: 'border-red-500', text: 'text-red-400', icon: 'warning' as IconName },
    warning: { bg: 'bg-amber-900/10', border: 'border-amber-500/30', text: 'text-amber-500', icon: 'warning' as IconName },
    info: { bg: 'bg-sky-900/10', border: 'border-sky-500/30', text: 'text-sky-400', icon: 'info' as IconName },
  };

  const style = config[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-4 shadow-sm ${style.bg} ${style.border}`}>
      <div className={`shrink-0 mt-0.5 ${style.text}`}>
         <Icon name={style.icon} className="w-6 h-6" />
      </div>
      <div>
        {title && <h4 className={`font-bold mb-1 ${style.text}`}>{title}</h4>}
        <div className="text-sm text-base-content/80 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}