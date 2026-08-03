import type { HourlyCalcResult } from '../types';

export const calculateWageFromMonthlyTarget = (val: number, type: 'net' | 'gross', baseHours: number): HourlyCalcResult => {
  let monthlyGross = 0;
  if (type === 'gross') {
    monthlyGross = val;
  } else {
    if (val > 4462) {
      monthlyGross = (val - 4462.03) / 0.71491;
    } else {
      monthlyGross = val / 0.85;
    }
  }
  const dailyGross = monthlyGross / 30;
  const hourlyGross = dailyGross / baseHours;
  const overtimeGross = hourlyGross * 1.5;

  return {
    monthlyGross: Number(monthlyGross.toFixed(2)),
    dailyGross: Number(dailyGross.toFixed(2)),
    hourlyGross: Number(hourlyGross.toFixed(2)),
    overtimeGross: Number(overtimeGross.toFixed(2))
  };
};

export const calculateWageFromHourlyTarget = (val: number, type: 'net' | 'gross', baseHours: number): HourlyCalcResult => {
  let monthlyGross = 0;
  let hourlyGross = 0;

  if (type === 'gross') {
    hourlyGross = val;
    monthlyGross = hourlyGross * baseHours * 30;
  } else {
    const dailyNet = val * baseHours;
    const monthlyNet = dailyNet * 30;

    if (monthlyNet > 4462) {
      monthlyGross = (monthlyNet - 4462.03) / 0.71491;
    } else {
      monthlyGross = monthlyNet / 0.85;
    }
    hourlyGross = (monthlyGross / 30) / baseHours;
  }

  const dailyGross = monthlyGross / 30;
  const overtimeGross = hourlyGross * 1.5;

  return {
    monthlyGross: Number(monthlyGross.toFixed(2)),
    dailyGross: Number(dailyGross.toFixed(2)),
    hourlyGross: Number(hourlyGross.toFixed(2)),
    overtimeGross: Number(overtimeGross.toFixed(2))
  };
};