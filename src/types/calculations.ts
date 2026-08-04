export interface PayrollIncomes {
  baseMonth: number;
  overtime: number;
  nightBonus: number;
  holidayWork: number;
  extra: number;
  extraSgkExempt: boolean;
  totalGrossHakedis: number;
}

export interface PayrollDeductions {
  absent: number;
  late: number;
}

export interface PayrollTaxes {
  sgk: number;
  unemployment: number;
  incomeTax: number;
  stampTax: number;
}

export interface PayrollNetDeductions {
  bes: number;
  other: number;
}

export interface PayrollResult {
  incomes: PayrollIncomes;
  deductionsGross: PayrollDeductions;
  newGrossMatrah: number;
  taxes: PayrollTaxes;
  netKesintiler: PayrollNetDeductions;
  hesabaYatanNet: number;
}

export interface SeveranceResult {
  yearsWorked: number;
  severanceGross: number;
  severanceStampTax: number;
  severanceNet: number;
  noticeWeeks: number;
  noticeGross: number;
  noticeIncomeTax: number;
  noticeNet: number;
  noticeStampTax: number;
  totalNet: number;
}

export interface HourlyCalcResult {
  monthlyGross: number;
  dailyGross: number;
  hourlyGross: number;
  overtimeGross: number;
}

export interface LegacyPayrollData {
  incomes: { baseMonth: number; overtime: number; nightBonus: number; holidayWork: number; extra: number; extraSgkExempt: boolean; totalGrossHakedis: number; };
  deductionsGross: { absent: number; late: number; };
  newGrossMatrah: number;
  taxes: { sgk: number; unemployment: number; incomeTax: number; stampTax: number; };
  netKesintiler: { bes: number; other: number; total: number; };
  hesabaYatanNet: number;
  stats: {
    totalMesai: number; totalGece: number; totalTatil: number; devamsizlik: number; gecKalma: number;
    payrollDays: number; overtimeHours: number; holidayWorkDays: number; absentDays: number; lateHours: number; annualLeaveDays: number;
  };
  baseGrossInfo?: any; 
  calculatedNightHours?: number;
  netMaaş: number; 
}