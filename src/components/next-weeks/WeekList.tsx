import type { WeekListProps } from '../../types';
import { formatWeekRange } from '../../utils/dateUtils';

export default function WeekList({ upcomingWeeks }: WeekListProps) {
  return (
    <div className="card bg-[#16191d] shadow-xl border border-base-300 w-full max-w-4xl">
      <div className="card-body p-4 sm:p-8">
        <div className="flex flex-col gap-3">
          {upcomingWeeks.map((item, index) => {
            const dateString = formatWeekRange(item.weekStart, item.weekEnd);
            const isCurrentWeek = index === 0; 
            
            return (
              <div 
                key={index} 
                className={`p-4 rounded-xl text-center text-lg font-medium border flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 transition-all
                  ${isCurrentWeek 
                    ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400 shadow-md' 
                    : 'bg-base-200 border-base-300 text-base-content/80 hover:bg-base-300'}`
                }
              >
                <span className="w-48 text-right hidden sm:block">{dateString}</span>
                <span className="sm:hidden">{dateString}</span>
                
                <span className="hidden sm:block opacity-50">-</span>
                
                <span className={`w-48 text-left ${isCurrentWeek ? 'font-bold' : ''}`}>
                  {item.shiftName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}