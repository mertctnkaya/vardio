export interface WeekItem {
  weekStart: Date;
  weekEnd: Date;
  shiftName: string;
}

export interface WeekListProps {
  upcomingWeeks: WeekItem[];
}