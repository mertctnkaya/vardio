import { TAX_CONSTANTS } from '../constants/taxRates';

export const calculateNightHours = (startTimeStr: string, durationHours: number) => {
  if (!startTimeStr || durationHours <= 0) return 0;
  const [h, m] = startTimeStr.split(':').map(Number);
  let nightMins = 0;
  let currentMin = h * 60 + m;

  for (let i = 0; i < durationHours * 60; i++) {
    let minOfDay = (currentMin + i) % (24 * 60);
    if (minOfDay >= 1320 || minOfDay < 360) {
      nightMins++;
    }
  }
  return nightMins / 60;
};

export const generatePayrollData = (settings: any, fetchedLogs: any[], payrollDate: Date, besDeduction: string, otherDeductions: string) => {
  const defaultData = {
    baseGrossInfo: { daily: 0, hourly: 0 },
    incomes: { baseMonth: 0, overtime: 0, nightBonus: 0, holidayWork: 0, totalGrossHakedis: 0, extra: 0 },
    deductionsGross: { absent: 0, late: 0, totalGrossKesinti: 0 },
    newGrossMatrah: 0,
    taxes: { sgk: 0, unemployment: 0, incomeTax: 0, stampTax: 0, totalYasalKesinti: 0 },
    netMaaş: 0,
    netKesintiler: { bes: 0, other: 0, total: 0 },
    hesabaYatanNet: 0,
    calculatedNightHours: 0,
    stats: { payrollDays: 0, activeDays: 0, passedDays: 0, absentDays: 0, lateHours: 0, overtimeHours: 0, holidayWorkDays: 0, annualLeaveDays: 0 }
  };

  if (!settings) return defaultData;

  const year = payrollDate.getFullYear();
  const month = payrollDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const logsMap: Record<string, any> = {};
  fetchedLogs.forEach(log => logsMap[log.log_date] = log);

  const dailyGross = Number(settings.daily_wage) || 0;
  const baseWorkHours = Number(settings.base_work_hours) || 7.5;
  const hourlyGross = dailyGross / baseWorkHours;

  const overtimeMultiplier = 1.5;
  const nightBonusPercent = Number(settings.night_bonus_percent) || 0;
  const hourlyNightBonus = hourlyGross * (nightBonusPercent / 100);
  const holidayMultiplier = Number(settings.holiday_multiplier) || 2;

  const empDateStr = settings.employment_start_date || '2026-06-09';
  const [eYear, eMonth, eDay] = empDateStr.split('-').map(Number);
  const employmentStart = new Date(eYear, eMonth - 1, eDay);

  const epDateStr = settings.shift_epoch_date || '2026-07-06';
  const [epYear, epMonth, epDay] = epDateStr.split('-').map(Number);
  const epochDate = new Date(epYear, epMonth - 1, epDay);

  const workType = settings.work_type || '3-shift';
  const shiftStartTime = settings.shift_start_time || '08:00';
  const isSaturdayWork = settings.is_saturday_workday || false;
  const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

  let stats = { payrollDays: 30, activeDays: 0, passedDays: 0, absentDays: 0, lateHours: 0, overtimeHours: 0, holidayWorkDays: 0, annualLeaveDays: 0 };
  let calculatedNightHours = 0;

  const actualToday = new Date();
  actualToday.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(year, month, i);
    if (currentDate < employmentStart) continue;

    stats.activeDays++;
    if (currentDate <= actualToday) stats.passedDays++;

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const log = logsMap[dateKey];

    const dayOfWeek = currentDate.getDay();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const isOffDay = workType === 'fixed' ? (isSunday || (!isSaturdayWork && isSaturday)) : isSunday;

    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const diffMs = monday.getTime() - epochDate.getTime();
    const deltaWeeks = Math.floor(diffMs / MS_PER_WEEK);

    let currentShiftStart = shiftStartTime;
    let shiftPhysicalDuration = workType === '3-shift' ? 8 : (Number(settings.shift_duration) || 12);

    if (workType === '3-shift') {
      const shiftIndex = ((deltaWeeks % 3) + 3) % 3;
      const [sh, sm] = shiftStartTime.split(':').map(Number);
      if (shiftIndex === 1) currentShiftStart = `${String((sh + 16) % 24).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
      else if (shiftIndex === 2) currentShiftStart = `${String((sh + 8) % 24).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
    } else if (workType === '2-shift') {
      const shiftIndex = ((deltaWeeks % 2) + 2) % 2;
      const [sh, sm] = shiftStartTime.split(':').map(Number);
      if (shiftIndex === 1) currentShiftStart = `${String((sh + 12) % 24).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
    }

    const processNightHours = () => { calculatedNightHours += calculateNightHours(currentShiftStart, shiftPhysicalDuration); };

    if (log) {
      if (log.status === 'absent') stats.absentDays++;
      else if (log.status === 'late' || log.status === 'partial_leave') { stats.lateHours += (Number(log.hours) || 0); if (!isOffDay) processNightHours(); }
      else if (log.status === 'overtime') { stats.overtimeHours += (Number(log.hours) || 0); if (!isOffDay) processNightHours(); }
      else if (log.status === 'holiday_work') { stats.holidayWorkDays++; if (!isOffDay) processNightHours(); }
      else if (log.status === 'annual_leave') stats.annualLeaveDays++;
      else if (log.status === 'normal' || log.status === 'leave') { if (!isOffDay) processNightHours(); }
    } else {
      if (currentDate <= actualToday) { if (!isOffDay) processNightHours(); }
    }
  }

  const isPastMonth = (year < actualToday.getFullYear()) || (year === actualToday.getFullYear() && month < actualToday.getMonth());
  const basePayrollDays = isPastMonth ? Math.min(30, stats.activeDays) : Math.min(30, stats.passedDays);

  const baseGrossPay = basePayrollDays * dailyGross;
  const overtimeGrossPay = stats.overtimeHours * hourlyGross * overtimeMultiplier;
  const holidayWorkGrossPay = stats.holidayWorkDays * dailyGross * holidayMultiplier;
  const nightBonusGrossPay = calculatedNightHours * hourlyNightBonus;

  const totalGrossHakedis = baseGrossPay + overtimeGrossPay + holidayWorkGrossPay + nightBonusGrossPay;
  const absentDeductionGross = stats.absentDays * dailyGross;
  const lateDeductionGross = stats.lateHours * hourlyGross;
  const totalGrossKesinti = absentDeductionGross + lateDeductionGross;
  const newGrossMatrah = totalGrossHakedis - totalGrossKesinti;

  const sgkCut = newGrossMatrah * TAX_CONSTANTS.SGK_RATE;
  const unempCut = newGrossMatrah * TAX_CONSTANTS.UNEMPLOYMENT_RATE;
  const taxBase = newGrossMatrah - sgkCut - unempCut;

  const incomeTaxRaw = taxBase * TAX_CONSTANTS.TAX_RATE_TIER_1;
  const incomeTaxFinal = Math.max(0, incomeTaxRaw - TAX_CONSTANTS.MIN_WAGE_GV_EXEMPTION);
  const stampTaxRaw = newGrossMatrah * TAX_CONSTANTS.STAMP_TAX_RATE;
  const stampTaxFinal = Math.max(0, stampTaxRaw - TAX_CONSTANTS.MIN_WAGE_DV_EXEMPTION);

  const totalYasalKesinti = sgkCut + unempCut + incomeTaxFinal + stampTaxFinal;
  const netMaaş = newGrossMatrah - totalYasalKesinti;

  const bes = Number(besDeduction) || 0;
  const others = Number(otherDeductions) || 0;
  const hesabaYatanNet = netMaaş - bes - others;

  return {
    baseGrossInfo: { daily: dailyGross, hourly: hourlyGross },
    incomes: { baseMonth: baseGrossPay, overtime: overtimeGrossPay, nightBonus: nightBonusGrossPay, holidayWork: holidayWorkGrossPay, totalGrossHakedis, extra: 0 },
    deductionsGross: { absent: absentDeductionGross, late: lateDeductionGross, totalGrossKesinti },
    newGrossMatrah,
    taxes: { sgk: sgkCut, unemployment: unempCut, incomeTax: incomeTaxFinal, stampTax: stampTaxFinal, totalYasalKesinti },
    netMaaş,
    netKesintiler: { bes, other: others, total: bes + others },
    hesabaYatanNet,
    calculatedNightHours,
    stats: { ...stats, payrollDays: basePayrollDays }
  };
};

/* export const calculatePayroll = (
  baseMonth: number,
  overtime: number,
  nightBonus: number,
  holidayWork: number,
  extra: number,
  extraSgkExempt: boolean,
  absent: number,
  late: number,
  bes: number,
  other: number
): PayrollResult => {
  // 1. Brüt Hakedişleri Topla
  const totalGrossHakedis = baseMonth + overtime + nightBonus + holidayWork + extra;

  // 2. Devamsızlık ve Geç Kalma Kesintilerini Düş (Yeni Brüt Matrah)
  const deductionsGrossTotal = absent + late;
  const newGrossMatrah = Math.max(0, totalGrossHakedis - deductionsGrossTotal);

  // 3. Vergileri Hesapla (70 TL'lik ince ayar mantığı burada korunuyor)
  let sgkMatrah = newGrossMatrah;
  
  // Eğer ek kazanç SGK'dan muafsa (Örn: Yol/Yemek istisnası), SGK matrahından düşürülür
  if (extraSgkExempt && extra > 0) {
    sgkMatrah = Math.max(0, sgkMatrah - extra);
  }

  // SGK İşçi Payı (%14) ve İşsizlik Payı (%1)
  const sgk = sgkMatrah * 0.14;
  const unemployment = sgkMatrah * 0.01;

  // Gelir Vergisi Matrahı (Brüt - SGK - İşsizlik)
  const incomeTaxMatrah = Math.max(0, newGrossMatrah - sgk - unemployment);
  
  // Gelir Vergisi (%15 - 1. Dilim varsayılan)
  const incomeTax = incomeTaxMatrah * TAX_CONSTANTS.INCOME_TAX_TIER_1;
  
  // Damga Vergisi (Binde 7.59 - Yeni Brüt Matrah üzerinden)
  const stampTax = newGrossMatrah * TAX_CONSTANTS.STAMP_TAX_RATE;

  // 4. Net Maaşı Bul
  // Toplam Yasal Kesintiler
  const totalTaxes = sgk + unemployment + incomeTax + stampTax;
  const netBeforeDeductions = newGrossMatrah - totalTaxes;

  // Özel Kesintiler (BES, İcra vb.)
  const totalNetDeductions = bes + other;
  
  // Hesaba Yatan Son Net Para
  const hesabaYatanNet = Math.max(0, netBeforeDeductions - totalNetDeductions);

  return {
    incomes: {
      baseMonth,
      overtime,
      nightBonus,
      holidayWork,
      extra,
      extraSgkExempt,
      totalGrossHakedis
    },
    deductionsGross: {
      absent,
      late
    },
    newGrossMatrah,
    taxes: {
      sgk,
      unemployment,
      incomeTax,
      stampTax
    },
    netKesintiler: {
      bes,
      other
    },
    hesabaYatanNet
  };
}; */