import type { SeveranceResult } from '../types';
import { TAX_CONSTANTS } from '../constants/taxRates';

export const calculateSeverance = (settings: any, terminationDate: string, payNotice: boolean): SeveranceResult => {
  const start = new Date(settings?.employment_start_date || '2026-06-09');
  const end = new Date(terminationDate);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const yearsWorked = diffDays / 365.25;

  const monthlyGross = (settings?.daily_wage || 0) * 30;

  let severanceGross = 0;
  if (yearsWorked >= 1) severanceGross = yearsWorked * monthlyGross;
  const severanceStampTax = severanceGross * TAX_CONSTANTS.STAMP_TAX_RATE;
  const severanceNet = Math.max(0, severanceGross - severanceStampTax);

  let noticeWeeks = 0;
  if (yearsWorked < 0.5) noticeWeeks = 2;
  else if (yearsWorked < 1.5) noticeWeeks = 4;
  else if (yearsWorked < 3) noticeWeeks = 6;
  else noticeWeeks = 8;

  let noticeGross = 0;
  if (payNotice) noticeGross = (monthlyGross / 30) * 7 * noticeWeeks;

  const noticeIncomeTax = noticeGross * 0.15;
  const noticeStampTax = noticeGross * TAX_CONSTANTS.STAMP_TAX_RATE;
  const noticeNet = Math.max(0, noticeGross - noticeIncomeTax - noticeStampTax);

  const totalNet = severanceNet + noticeNet;

  return {
    yearsWorked, severanceGross, severanceStampTax, severanceNet,
    noticeWeeks, noticeGross, noticeIncomeTax, noticeStampTax, noticeNet,
    totalNet
  };
};

/* export const calculateSeverance = (
  settings: UserSettings | null,
  terminationDateStr: string,
  payNotice: boolean
): SeveranceResult => {
  const start = new Date(settings?.employment_start_date || '2026-06-09');
  const end = new Date(terminationDateStr);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const yearsWorked = diffDays / 365.25;

  const monthlyGross = (settings?.daily_wage || 0) * 30;
  
  let severanceGross = 0;
  if (yearsWorked >= 1) {
      severanceGross = yearsWorked * monthlyGross;
  }
  const severanceStampTax = severanceGross * TAX_CONSTANTS.STAMP_TAX_RATE;
  const severanceNet = Math.max(0, severanceGross - severanceStampTax);

  let noticeWeeks = 0;
  if (yearsWorked < 0.5) noticeWeeks = 2;
  else if (yearsWorked < 1.5) noticeWeeks = 4;
  else if (yearsWorked < 3) noticeWeeks = 6;
  else noticeWeeks = 8;

  let noticeGross = 0;
  if (payNotice) {
     noticeGross = (monthlyGross / 30) * 7 * noticeWeeks;
  }
  
  const noticeIncomeTax = noticeGross * TAX_CONSTANTS.INCOME_TAX_TIER_1;
  const noticeStampTax = noticeGross * TAX_CONSTANTS.STAMP_TAX_RATE;
  const noticeNet = Math.max(0, noticeGross - noticeIncomeTax - noticeStampTax);

  const totalNet = severanceNet + noticeNet;

  return {
    yearsWorked,
    severanceGross,
    severanceStampTax,
    severanceNet,
    noticeWeeks,
    noticeGross,
    noticeIncomeTax,
    noticeStampTax,
    noticeNet,
    totalNet
  };
}; */