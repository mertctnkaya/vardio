import React from 'react';

export type IconName = 
  | 'crown' | 'users' | 'calendar' | 'bell' | 'trash' 
  | 'close' | 'check' | 'warning' | 'info' | 'mail' | 'premium';

export interface IconProps {
  name: IconName;
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  desc: string;
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'rose' | 'indigo' | 'white' | 'gray';
  iconName?: IconName;
}

export type AlertColor = 'emerald' | 'red' | 'amber' | 'sky' | 'pink' | 'yellow' | 'indigo' | 'gray' | 'violet';

export interface AlertProps {
  color: AlertColor;
  title?: string;
  children: React.ReactNode;
  className?: string; 
  bgStyle?: 'colored' | 'base' | 'transparent';
  borderStyle?: 'colored' | 'left-colored' | 'base' | 'none';
  icon?: IconName | 'none';
  titleColored?: boolean;
}

export interface ExportPanelProps {
  title?: string;
  description?: string;
  onExportCSV: () => void;
  onPrintPDF: () => void;
  onExportJSON: () => void;
}