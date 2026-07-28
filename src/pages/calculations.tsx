import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';

// 2026 Yılı Türkiye Yasal Kesinti Oranları ve İstisnaları
const CONSTANTS = {
  SGK_RATE: 0.14,
  UNEMPLOYMENT_RATE: 0.01,
  STAMP_TAX_RATE: 0.00759,
  TAX_RATE_TIER_1: 0.15,
  MIN_WAGE_GV_EXEMPTION: 4211.33,
  MIN_WAGE_DV_EXEMPTION: 250.70
};

export default function Calculations() {
  const { settings, user, setSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState<'payroll' | 'annual_leave' | 'tazminat' | 'hourly' | 'tools'>('payroll');

  const [payrollDate, setPayrollDate] = useState(new Date());
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false);
  const [fetchedLogs, setFetchedLogs] = useState<any[]>([]);

  // Yıllık İzin State'leri
  const [knownLeaveBalance, setKnownLeaveBalance] = useState('');
  const [isSavingLeave, setIsSavingLeave] = useState(false);
  const [leaveFeedback, setLeaveFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Tazminat State'leri
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNotice, setPayNotice] = useState(true);

  // Saatlik Hesap State'leri
  const [hourlyInputType, setHourlyInputType] = useState<'net' | 'gross'>('net');
  const [hourlyInputValue, setHourlyInputValue] = useState('');
  const [hourlyCalcResults, setHourlyCalcResults] = useState<{ monthlyGross: number, dailyGross: number, hourlyGross: number, overtimeGross: number } | null>(null);

  // --- GERÇEK BORDRO GİRDİLERİ (Aylık Brüt Inputu Ayarlara Bağlandığı İçin Silindi) ---
  const [besDeduction, setBesDeduction] = useState('0'); // Varsayılan 0
  const [otherDeductions, setOtherDeductions] = useState('0');

  const [payrollData, setPayrollData] = useState({
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
  });

  const fetchWorkLogs = async () => {
    if (!user) return;
    setIsLoadingPayroll(true);
    try {
      const year = payrollDate.getFullYear();
      const month = payrollDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      const { data: logs } = await supabase.from('work_logs').select('*').eq('user_id', user.id).gte('log_date', firstDayStr).lte('log_date', lastDayStr);
      setFetchedLogs(logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPayroll(false);
    }
  };

  // --- GECE SAATİ (22:00 - 06:00) HESAPLAMA YARDIMCISI ---
  const calculateNightHours = (startTimeStr: string, durationHours: number) => {
    if (!startTimeStr || durationHours <= 0) return 0;
    const [h, m] = startTimeStr.split(':').map(Number);
    let nightMins = 0;
    let currentMin = h * 60 + m;

    for (let i = 0; i < durationHours * 60; i++) {
      let minOfDay = (currentMin + i) % (24 * 60);
      // Gece tanımı: 22:00 (1320. dk) ile 06:00 (360. dk) arası
      if (minOfDay >= 1320 || minOfDay < 360) {
        nightMins++;
      }
    }
    return nightMins / 60;
  };

  // --- ANA BORDRO MOTORU (BRÜT -> NET) ---
  const calculatePayrollMotor = () => {
    if (!settings) return;

    const year = payrollDate.getFullYear();
    const month = payrollDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const logsMap: Record<string, any> = {};
    fetchedLogs.forEach(log => logsMap[log.log_date] = log);

    // KATSAYILAR (Ana veri AYARLARDAN OTOMATİK ÇEKİLİR)
    const dailyGross = Number(settings.daily_wage) || 0;
    const baseWorkHours = Number(settings.base_work_hours) || 7.5;
    const hourlyGross = dailyGross / baseWorkHours;

    const overtimeMultiplier = 1.5;
    const nightBonusPercent = Number(settings.night_bonus_percent) || 0;
    const hourlyNightBonus = hourlyGross * (nightBonusPercent / 100);
    const holidayMultiplier = Number(settings.holiday_multiplier) || 2;

    // BAŞLANGIÇ TARİHİ KONTROLÜ
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

    // 1. ADIM: TAKVİM DÖNGÜSÜ
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);

      // İşe girişten önceki günler maaşa dahil edilmez
      if (currentDate < employmentStart) {
        continue;
      }

      stats.activeDays++;
      // Bugün dahil, bu ay yaşanmış olan günleri say (Temmuz bug'ı çözümü)
      if (currentDate <= actualToday) {
        stats.passedDays++;
      }

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

      // Vardiya Saatini Tespit Et
      let currentShiftStart = shiftStartTime;
      // Gece saati hesaplanırken vardiyanın tam penceresi taranır (3'lü sistemde 8 saat)
      let shiftPhysicalDuration = workType === '3-shift' ? 8 : (Number(settings.shift_duration) || 12);

      if (workType === '3-shift') {
        const shiftIndex = ((deltaWeeks % 3) + 3) % 3;
        const [sh, sm] = shiftStartTime.split(':').map(Number);
        if (shiftIndex === 1) { // Gece Vardiyası (00:00 - 08:00)
          currentShiftStart = `${String((sh + 16) % 24).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
        } else if (shiftIndex === 2) { // Akşam Vardiyası (16:00 - 24:00)
          currentShiftStart = `${String((sh + 8) % 24).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
        }
      } else if (workType === '2-shift') {
        const shiftIndex = ((deltaWeeks % 2) + 2) % 2;
        const [sh, sm] = shiftStartTime.split(':').map(Number);
        if (shiftIndex === 1) {
          currentShiftStart = `${String((sh + 12) % 24).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
        }
      }

      const processNightHours = () => {
        calculatedNightHours += calculateNightHours(currentShiftStart, shiftPhysicalDuration);
      };

      if (log) {
        if (log.status === 'absent') stats.absentDays++;
        else if (log.status === 'late' || log.status === 'partial_leave') {
          stats.lateHours += (Number(log.hours) || 0);
          if (!isOffDay) processNightHours();
        }
        else if (log.status === 'overtime') {
          stats.overtimeHours += (Number(log.hours) || 0);
          if (!isOffDay) processNightHours();
        }
        else if (log.status === 'holiday_work') {
          stats.holidayWorkDays++;
          if (!isOffDay) processNightHours();
        }
        // Eksik olan kritik satır:
        else if (log.status === 'annual_leave') {
          stats.annualLeaveDays++;
        }
        else if (log.status === 'normal' || log.status === 'leave') {
          if (!isOffDay) processNightHours();
        }
      } else {
        // Log yoksa sadece bugüne kadar yaşanmış günlerin gece saatlerini ekle
        if (currentDate <= actualToday) {
          if (!isOffDay) processNightHours();
        }
      }
    }

    // 2. ADIM: BRÜT HAKEDİŞLER
    // Gelecek aylarda 0, geçmiş aylarda aktif gün kadar, içinde bulunduğumuz ayda sadece yaşanmış günler kadar hesapla
    const isPastMonth = (year < actualToday.getFullYear()) || (year === actualToday.getFullYear() && month < actualToday.getMonth());
    const basePayrollDays = isPastMonth ? Math.min(30, stats.activeDays) : Math.min(30, stats.passedDays);

    const baseGrossPay = basePayrollDays * dailyGross;

    const overtimeGrossPay = stats.overtimeHours * hourlyGross * overtimeMultiplier;
    const holidayWorkGrossPay = stats.holidayWorkDays * dailyGross * holidayMultiplier;
    const nightBonusGrossPay = calculatedNightHours * hourlyNightBonus;

    const totalGrossHakedis = baseGrossPay + overtimeGrossPay + holidayWorkGrossPay + nightBonusGrossPay;

    // 3. ADIM: BRÜT KESİNTİLER
    const absentDeductionGross = stats.absentDays * dailyGross;
    const lateDeductionGross = stats.lateHours * hourlyGross;
    const totalGrossKesinti = absentDeductionGross + lateDeductionGross;

    // 4. ADIM: YENİ BRÜT MATRAH
    const newGrossMatrah = totalGrossHakedis - totalGrossKesinti;

    // 5. ADIM: YASAL KESİNTİLER (Yeni Brüt Üzerinden)
    const sgkCut = newGrossMatrah * CONSTANTS.SGK_RATE;
    const unempCut = newGrossMatrah * CONSTANTS.UNEMPLOYMENT_RATE;
    const taxBase = newGrossMatrah - sgkCut - unempCut;

    const incomeTaxRaw = taxBase * CONSTANTS.TAX_RATE_TIER_1;
    const incomeTaxFinal = Math.max(0, incomeTaxRaw - CONSTANTS.MIN_WAGE_GV_EXEMPTION);

    const stampTaxRaw = newGrossMatrah * CONSTANTS.STAMP_TAX_RATE;
    const stampTaxFinal = Math.max(0, stampTaxRaw - CONSTANTS.MIN_WAGE_DV_EXEMPTION);

    const totalYasalKesinti = sgkCut + unempCut + incomeTaxFinal + stampTaxFinal;

    // 6. ADIM: NET MAAŞ
    const netMaaş = newGrossMatrah - totalYasalKesinti;

    // 7. ADIM: ÖZEL KESİNTİLER VE HESABA YATAN
    const bes = Number(besDeduction) || 0;
    const others = Number(otherDeductions) || 0;
    const hesabaYatanNet = netMaaş - bes - others;

    setPayrollData({
      baseGrossInfo: { daily: dailyGross, hourly: hourlyGross },
      incomes: { baseMonth: baseGrossPay, overtime: overtimeGrossPay, nightBonus: nightBonusGrossPay, holidayWork: holidayWorkGrossPay, totalGrossHakedis: totalGrossHakedis, extra: 0 },
      deductionsGross: { absent: absentDeductionGross, late: lateDeductionGross, totalGrossKesinti },
      newGrossMatrah,
      taxes: { sgk: sgkCut, unemployment: unempCut, incomeTax: incomeTaxFinal, stampTax: stampTaxFinal, totalYasalKesinti },
      netMaaş,
      netKesintiler: { bes, other: others, total: bes + others },
      hesabaYatanNet,
      calculatedNightHours,
      stats: { ...stats, payrollDays: basePayrollDays }
    });
  };

  useEffect(() => {
    if (activeTab === 'payroll') fetchWorkLogs();
  }, [payrollDate, activeTab]);

  useEffect(() => {
    calculatePayrollMotor();
  }, [fetchedLogs, settings, besDeduction, otherDeductions]);

  // =========================================================================
  // ARAÇLAR İÇİN DÖNÜŞTÜRÜCÜ VE KATSAYI KAYIT İŞLEMİ
  // =========================================================================
  const [calcTargetType, setCalcTargetType] = useState<'gross' | 'net'>('net');
  const [calcTargetValue, setCalcTargetValue] = useState('');
  const [calcResults, setCalcResults] = useState<{ monthlyGross: number, dailyGross: number, hourlyGross: number, overtimeGross: number } | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const performCalculation = () => {
    const cleanValue = calcTargetValue.replace(/\./g, '').replace(',', '.');
    const val = Number(cleanValue);
    if (!val || val <= 0) return;

    let monthlyGross = 0;

    if (calcTargetType === 'gross') {
      monthlyGross = val;
    } else {
      if (val > 4462) {
        monthlyGross = (val - 4462.03) / 0.71491;
      } else {
        monthlyGross = val / 0.85;
      }
    }

    const baseHours = settings?.base_work_hours ? Number(settings.base_work_hours) : 7.5;
    const dailyGross = monthlyGross / 30;
    const hourlyGross = dailyGross / baseHours;
    const overtimeGross = hourlyGross * 1.5;

    setCalcResults({
      monthlyGross: Number(monthlyGross.toFixed(2)),
      dailyGross: Number(dailyGross.toFixed(2)),
      hourlyGross: Number(hourlyGross.toFixed(2)),
      overtimeGross: Number(overtimeGross.toFixed(2))
    });
  };

  // YILLIK İZİN BAKİYE EŞİTLEME FONKSİYONU
  const saveLeaveBalance = async (earnedLeave: number) => {
    if (!user || knownLeaveBalance === '') return;
    setIsSavingLeave(true);

    const val = Number(knownLeaveBalance);
    const pastUsed = Math.max(0, earnedLeave - val);

    // upsert yerine update kullanıyoruz
    const { error, data } = await supabase.from('user_settings')
      .update({
        past_used_leave: pastUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select().single();

    if (!error && data) {
      setSettings(data);
      setLeaveFeedback({ type: 'success', message: 'İzin bakiyeniz eşitlendi!' });
      setTimeout(() => { setLeaveFeedback(null); setKnownLeaveBalance(''); }, 3000);
    } else {
      setLeaveFeedback({ type: 'error', message: 'Hata oluştu: ' + (error?.message || '') });
      setTimeout(() => setLeaveFeedback(null), 3000);
    }
    setIsSavingLeave(false);
  };

  const resetLeaveBalance = async () => {
    if (!user) return;
    setIsSavingLeave(true);
    const { error, data } = await supabase.from('user_settings')
      .update({ past_used_leave: 0, updated_at: new Date().toISOString() })
      .eq('user_id', user.id).select().single();
      
    if (!error && data) {
      setSettings(data);
      setLeaveFeedback({ type: 'success', message: 'Geçmiş izin kullanımları sıfırlandı!' });
      setTimeout(() => setLeaveFeedback(null), 3000);
    }
    setIsSavingLeave(false);
  };

  // ARAÇLAR İÇİN DÖNÜŞTÜRÜCÜ VE KATSAYI KAYIT İŞLEMİ
  const saveToSettings = async () => {
    if (!user || !calcResults) return;
    setIsSavingSettings(true);

    const { error, data } = await supabase.from('user_settings')
      .update({
        daily_wage: calcResults.dailyGross,
        hourly_overtime: calcResults.overtimeGross,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select().single();

    if (!error && data) {
      setSettings(data);
      setFeedback({ type: 'success', message: 'Maaş katsayılarınız sisteme otomatik kaydedildi!' });
      setTimeout(() => {
        setFeedback(null);
        setCalcResults(null);
        setCalcTargetValue('');
      }, 3000);
    } else {
      setFeedback({ type: 'error', message: 'Kaydedilirken hata oluştu: ' + (error?.message || '') });
      setTimeout(() => setFeedback(null), 3000);
    }
    setIsSavingSettings(false);
  };

  const performHourlyCalculation = () => {
    const cleanValue = hourlyInputValue.replace(/\./g, '').replace(',', '.');
    const val = Number(cleanValue);
    if (!val || val <= 0) return;

    const baseHours = settings?.base_work_hours ? Number(settings.base_work_hours) : 7.5;

    let monthlyGross = 0;
    let hourlyGross = 0;

    if (hourlyInputType === 'gross') {
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

    setHourlyCalcResults({
      monthlyGross: Number(monthlyGross.toFixed(2)),
      dailyGross: Number(dailyGross.toFixed(2)),
      hourlyGross: Number(hourlyGross.toFixed(2)),
      overtimeGross: Number(overtimeGross.toFixed(2))
    });
  };

  const saveHourlyToSettings = async () => {
    if (!user || !hourlyCalcResults) return;
    setIsSavingSettings(true);

    const { error, data } = await supabase.from('user_settings')
      .update({
        daily_wage: hourlyCalcResults.dailyGross,
        hourly_overtime: hourlyCalcResults.overtimeGross,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select().single();

    if (!error && data) {
      setSettings(data);
      setFeedback({ type: 'success', message: 'Saatlik katsayılarınız sisteme kaydedildi!' });
      setTimeout(() => {
        setFeedback(null);
        setHourlyCalcResults(null);
        setHourlyInputValue('');
      }, 3000);
    } else {
      setFeedback({ type: 'error', message: 'Kaydedilirken hata oluştu: ' + (error?.message || '') });
      setTimeout(() => setFeedback(null), 3000);
    }
    setIsSavingSettings(false);
  };

  // YENİ: Tazminat Hesaplama Motoru (Dışa aktarabilmek için buraya alındı)
  const severanceData = useMemo(() => {
    const start = new Date(settings?.employment_start_date || '2026-06-09');
    const end = new Date(terminationDate);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const yearsWorked = diffDays / 365.25;

    const monthlyGross = (settings?.daily_wage || 0) * 30;

    let severanceGross = 0;
    if (yearsWorked >= 1) severanceGross = yearsWorked * monthlyGross;
    const severanceStampTax = severanceGross * CONSTANTS.STAMP_TAX_RATE;
    const severanceNet = Math.max(0, severanceGross - severanceStampTax);

    let noticeWeeks = 0;
    if (yearsWorked < 0.5) noticeWeeks = 2;
    else if (yearsWorked < 1.5) noticeWeeks = 4;
    else if (yearsWorked < 3) noticeWeeks = 6;
    else noticeWeeks = 8;

    let noticeGross = 0;
    if (payNotice) noticeGross = (monthlyGross / 30) * 7 * noticeWeeks;

    const noticeIncomeTax = noticeGross * 0.15;
    const noticeStampTax = noticeGross * CONSTANTS.STAMP_TAX_RATE;
    const noticeNet = Math.max(0, noticeGross - noticeIncomeTax - noticeStampTax);

    const totalNet = severanceNet + noticeNet;

    return {
      yearsWorked, severanceGross, severanceStampTax, severanceNet,
      noticeWeeks, noticeGross, noticeIncomeTax, noticeStampTax, noticeNet,
      totalNet
    };
  }, [settings, terminationDate, payNotice]);

  // --- HESAPLAMALAR DIŞA AKTARMA (EXPORT) MOTORLARI ---
  const getCalcExportName = (prefix: string) => {
    const dateStr = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(payrollDate).replace(/\s+/g, '_');
    const userName = user?.user_metadata?.name ? user.user_metadata.name.replace(/\s+/g, '_') : 'Rapor';
    return `Vardiyake_${prefix}_${dateStr}_${userName}`;
  };

  const printCalcToPDF = (prefix: string) => {
    const originalTitle = document.title;
    document.title = getCalcExportName(prefix);
    window.print();
    document.title = originalTitle;
  };

  const exportPayrollCSV = () => {
    let csv = "\uFEFFKalem,Tutar (TL)\n";
    csv += `Aylik Maas,${payrollData.incomes.baseMonth.toFixed(2)}\n`;
    csv += `Gece Primi,${payrollData.incomes.nightBonus.toFixed(2)}\n`;
    csv += `Fazla Mesai,${payrollData.incomes.overtime.toFixed(2)}\n`;
    csv += `Resmi Tatil,${payrollData.incomes.holidayWork.toFixed(2)}\n`;
    csv += `Ek Kazanc,${payrollData.incomes.extra.toFixed(2)}\n`;
    csv += `Toplam Brut Hakedis,${payrollData.incomes.totalGrossHakedis.toFixed(2)}\n`;
    csv += `Devamsizlik,-${payrollData.deductionsGross.absent.toFixed(2)}\n`;
    csv += `Gec Kalma,-${payrollData.deductionsGross.late.toFixed(2)}\n`;
    csv += `Yeni Brut Matrah,${payrollData.newGrossMatrah.toFixed(2)}\n`;
    csv += `SGK Isci Primi,-${payrollData.taxes.sgk.toFixed(2)}\n`;
    csv += `Issizlik Primi,-${payrollData.taxes.unemployment.toFixed(2)}\n`;
    csv += `Gelir Vergisi,-${payrollData.taxes.incomeTax.toFixed(2)}\n`;
    csv += `Damga Vergisi,-${payrollData.taxes.stampTax.toFixed(2)}\n`;
    csv += `BES Kesintisi,-${payrollData.netKesintiler.bes.toFixed(2)}\n`;
    csv += `Diger Kesintiler,-${payrollData.netKesintiler.other.toFixed(2)}\n`;
    csv += `NET MAAS,${payrollData.hesabaYatanNet.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${getCalcExportName('Bordro')}.csv`;
    link.click();
  };

  const exportPayrollJSON = () => {
    const blob = new Blob([JSON.stringify(payrollData, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${getCalcExportName('Bordro')}.json`;
    link.click();
  };

  const exportTazminatCSV = () => {
    let csv = "\uFEFFKalem,Deger\n";
    csv += `Calisilan Sure (Yil),${severanceData.yearsWorked.toFixed(2)}\n`;
    csv += `Brut Kidem,${severanceData.severanceGross.toFixed(2)}\n`;
    csv += `Kidem Damga Vergisi,-${severanceData.severanceStampTax.toFixed(2)}\n`;
    csv += `Net Kidem,${severanceData.severanceNet.toFixed(2)}\n`;
    csv += `Ihbar Suresi (Hafta),${severanceData.noticeWeeks}\n`;
    csv += `Brut Ihbar,${severanceData.noticeGross.toFixed(2)}\n`;
    csv += `Ihbar Vergi Kesintisi,-${(severanceData.noticeIncomeTax + severanceData.noticeStampTax).toFixed(2)}\n`;
    csv += `Net Ihbar,${severanceData.noticeNet.toFixed(2)}\n`;
    csv += `TOPLAM NET TAZMINAT,${severanceData.totalNet.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${getCalcExportName('Tazminat')}.csv`;
    link.click();
  };

  const exportTazminatJSON = () => {
    const blob = new Blob([JSON.stringify(severanceData, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${getCalcExportName('Tazminat')}.json`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10 p style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}">

      <div className="w-full max-w-5xl mb-6 px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-base-content">Gerçek Bordro Motoru</h2>
          <p className="text-base-content/60 mt-1">Türkiye standartlarında Brüt'ten Net'e kuruşu kuruşuna hesaplama.</p>
        </div>
      </div>

      <div className="w-full max-w-5xl px-2 mb-6 print:hidden">
        <div className="tabs tabs-boxed bg-[#16191d] p-1 border border-base-300 flex-wrap justify-center sm:justify-start">
          <a className={`tab tab-lg ${activeTab === 'payroll' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('payroll')}>Aylık Bordro</a>
          <a className={`tab tab-lg ${activeTab === 'annual_leave' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('annual_leave')}>Yıllık İzin</a>
          <a className={`tab tab-lg ${activeTab === 'tazminat' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('tazminat')}>Tazminat Hesapla</a>
          <a className={`tab tab-lg ${activeTab === 'hourly' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('hourly')}>Saatlikten Bul</a>
          <a className={`tab tab-lg ${activeTab === 'tools' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('tools')}>Araçlar (Aylıktan)</a>
        </div>
      </div>

      {activeTab === 'payroll' && (
        <div className="w-full max-w-5xl space-y-6 animate-fade-in">
          {/* BORDRO DIŞA AKTARMA (EXPORT) BUTONLARI */}
          <div className="mt-8 bg-[#1e2329] rounded-xl border border-base-300 p-6 shadow-lg animate-fade-in print:hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-bold text-base-content text-lg">Bordroyu Dışa Aktar</h4>
                <p className="text-sm text-base-content/60 mt-1">Hesaplanan aylık bordro dökümünüzü cihazınıza indirin veya yazdırın.</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button onClick={exportPayrollCSV} className="btn btn-sm sm:btn-md p-3 bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white border-green-500/30 flex-1 sm:flex-none">
                  Excel (CSV)
                </button>
                <button onClick={() => printCalcToPDF('Bordro')} className="btn btn-sm sm:btn-md p-3 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white border-red-500/30 flex-1 sm:flex-none">
                  Yazdır / PDF
                </button>
                <button onClick={exportPayrollJSON} className="btn btn-sm sm:btn-md p-3 btn-ghost bg-gray-700 border-base-300 text-base-content/60 hover:bg-base-200 flex-1 sm:flex-none">
                  JSON
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#16191d] rounded-xl border border-base-300 p-4 flex justify-between items-center shadow-lg">
            <button onClick={() => setPayrollDate(new Date(payrollDate.getFullYear(), payrollDate.getMonth() - 1, 1))} className="btn btn-sm btn-ghost hover:bg-base-200">&laquo; Önceki Ay</button>
            <h3 className="text-xl font-bold text-base-content">{new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(payrollDate)} Bordrosu</h3>
            <button onClick={() => setPayrollDate(new Date(payrollDate.getFullYear(), payrollDate.getMonth() + 1, 1))} className="btn btn-sm btn-ghost hover:bg-base-200">Sonraki Ay &raquo;</button>
          </div>

          <div className="bg-[#1e2329] p-5 rounded-xl border border-base-300 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-base-content/60 block mb-1">BES veya Özel Kesinti (₺)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-base-content/50">₺</span>
                <input type="number" placeholder="Yoksa 0 bırakın" value={besDeduction} onChange={(e) => setBesDeduction(e.target.value)} className="input input-bordered w-full bg-base-100 pl-7" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-base-content/60 block mb-1">Diğer Kesintiler (İcra, Avans vb.)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-base-content/50">₺</span>
                <input type="number" placeholder="Yoksa 0 bırakın" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} className="input input-bordered w-full bg-base-100 pl-7" />
              </div>
            </div>
          </div>

          {isLoadingPayroll ? (
            <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-indigo-500"></span></div>
          ) : (
            <>
              {/* ANA MAAŞ KARTI */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-[#16191d] rounded-2xl border border-indigo-500/30 p-8 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row justify-between items-center">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-indigo-300 font-medium mb-1">Tahmini Hesaba Yatan Net Maaş</p>
                  <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                    {payrollData.hesabaYatanNet.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-3xl text-indigo-400">₺</span>
                  </h1>
                </div>
                <div className="relative z-10 mt-4 sm:mt-0 text-right">
                  <p className="text-sm text-base-content/60">Bordroya Esas Gün: <strong>{payrollData.stats.payrollDays} Gün</strong></p>
                  <p className="text-sm text-base-content/60">Brüt Günlük: <strong>{payrollData.baseGrossInfo.daily.toFixed(2)} ₺</strong></p>
                </div>
              </div>

              {/* BORDRO ADIMLARI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. BRÜT HAKEDİŞLER */}
                <div className="bg-[#16191d] rounded-xl border border-base-300 shadow-lg overflow-hidden">
                  <div className="bg-emerald-900/20 p-4 border-b border-base-300">
                    <h4 className="font-bold text-emerald-400">1. Brüt Hakedişler</h4>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-end border-b border-base-300/50 pb-2">
                      <p className="text-base-content/80 font-medium">Aylık Maaş ({payrollData.stats.payrollDays} Gün)</p>
                      <span className="font-bold text-base-content">+{payrollData.incomes.baseMonth.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-base-300/50 pb-2">
                      <p className="text-base-content/80 font-medium">Gece Primi (22:00-06:00 / {payrollData.calculatedNightHours} Saat)</p>
                      <span className="font-bold text-emerald-400">+{payrollData.incomes.nightBonus.toFixed(2)} ₺</span>
                    </div>
                    {payrollData.stats.overtimeHours > 0 && (
                      <div className="flex justify-between items-end border-b border-base-300/50 pb-2">
                        <p className="text-base-content/80 font-medium">Fazla Mesai ({payrollData.stats.overtimeHours} Saat)</p>
                        <span className="font-bold text-emerald-400">+{payrollData.incomes.overtime.toFixed(2)} ₺</span>
                      </div>
                    )}
                    {payrollData.stats.holidayWorkDays > 0 && (
                      <div className="flex justify-between items-end pb-2">
                        <p className="text-base-content/80 font-medium">Resmi Tatil ({payrollData.stats.holidayWorkDays} Gün)</p>
                        <span className="font-bold text-emerald-400">+{payrollData.incomes.holidayWork.toFixed(2)} ₺</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-base-300 flex justify-between items-center text-sm bg-base-200 p-2 rounded">
                      <span className="font-bold">Toplam Brüt Hakediş</span>
                      <span className="font-bold text-emerald-400">{payrollData.incomes.totalGrossHakedis.toFixed(2)} ₺</span>
                    </div>
                  </div>
                </div>

                {/* 2. BRÜT KESİNTİLER & YENİ MATRAH */}
                <div className="flex flex-col gap-6">
                  <div className="bg-[#16191d] rounded-xl border border-base-300 shadow-lg overflow-hidden">
                    <div className="bg-amber-900/20 p-4 border-b border-base-300">
                      <h4 className="font-bold text-amber-500">2. Brüt Kesintiler</h4>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-end border-b border-base-300/50 pb-2">
                        <p className="text-base-content/80 font-medium">Devamsızlık / Ücretsiz İzin ({payrollData.stats.absentDays} Gün)</p>
                        <span className="font-bold text-amber-500">-{payrollData.deductionsGross.absent.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between items-end pb-2">
                        <p className="text-base-content/80 font-medium">Geç Kalma ({payrollData.stats.lateHours} Saat)</p>
                        <span className="font-bold text-amber-500">-{payrollData.deductionsGross.late.toFixed(2)} ₺</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-900/20 rounded-xl border border-indigo-500/30 p-4 flex justify-between items-center shadow-inner">
                    <span className="font-bold text-indigo-300">3. Yeni Brüt Matrah (SGK Öncesi)</span>
                    <span className="text-xl font-black text-white">{payrollData.newGrossMatrah.toFixed(2)} ₺</span>
                  </div>
                </div>

                {/* 4. YASAL KESİNTİLER */}
                <div className="bg-[#16191d] rounded-xl border border-base-300 shadow-lg overflow-hidden md:col-span-2">
                  <div className="bg-red-900/20 p-4 border-b border-base-300">
                    <h4 className="font-bold text-red-400">4. Yasal Kesintiler (SGK ve Vergiler)</h4>
                  </div>
                  <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-base-content/60 font-bold mb-1">SGK İşçi Primi (%14)</p>
                      <p className="font-bold text-red-400">-{payrollData.taxes.sgk.toFixed(2)} ₺</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60 font-bold mb-1">İşsizlik Primi (%1)</p>
                      <p className="font-bold text-red-400">-{payrollData.taxes.unemployment.toFixed(2)} ₺</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60 font-bold mb-1">Gelir Vergisi (İstisna Düşülmüş)</p>
                      <p className="font-bold text-red-400">-{payrollData.taxes.incomeTax.toFixed(2)} ₺</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60 font-bold mb-1">Damga Vergisi (İstisna Düşülmüş)</p>
                      <p className="font-bold text-red-400">-{payrollData.taxes.stampTax.toFixed(2)} ₺</p>
                    </div>
                  </div>
                  <div className="bg-base-200 p-4 flex justify-between items-center border-t border-base-300">
                    <span className="font-bold">Net Maaş (Vergi Sonrası)</span>
                    <span className="font-bold text-lg text-emerald-400">{payrollData.netMaaş.toFixed(2)} ₺</span>
                  </div>
                </div>

                {/* 5. ÖZEL KESİNTİLER */}
                {payrollData.netKesintiler.total > 0 && (
                  <div className="bg-[#16191d] rounded-xl border border-base-300 shadow-lg overflow-hidden md:col-span-2">
                    <div className="bg-orange-900/20 p-4 border-b border-base-300 flex justify-between">
                      <h4 className="font-bold text-orange-400">5. Özel Kesintiler (Net Üzerinden)</h4>
                      <span className="font-bold text-orange-400">-{payrollData.netKesintiler.total.toFixed(2)} ₺</span>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}
        </div>


      )}

      {/* YILLIK İZİN SEKME İÇERİĞİ */}
      {activeTab === 'annual_leave' && (
        <div className="w-full max-w-5xl space-y-6 animate-fade-in">
          {(() => {
            const start = new Date(settings?.employment_start_date || '2026-06-09');
            const today = new Date();
            const yearsWorked = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

            let earnedLeave = 0;
            for (let i = 1; i <= yearsWorked; i++) {
              if (i <= 5) earnedLeave += 14;
              else if (i < 15) earnedLeave += 20;
              else earnedLeave += 26;
            }

            // Bir Sonraki Hakediş Tarihi
            const nextLeaveDate = new Date(start);
            nextLeaveDate.setFullYear(start.getFullYear() + yearsWorked + 1);
            const nextLeaveDays = (yearsWorked + 1) <= 5 ? 14 : ((yearsWorked + 1) < 15 ? 20 : 26);

            // Veritabanından gelen geçmiş izin kullanımları ve bu ay takvimden gelenler
            const pastUsed = settings?.past_used_leave || 0;
            const usedThisMonth = payrollData.stats.annualLeaveDays || 0; // Bu ayki takvim işaretlemeleri
            const totalUsedLeave = pastUsed + usedThisMonth;
            const remainingLeave = earnedLeave - totalUsedLeave;

            return (
              <>
                <div className="bg-[#1e2329] rounded-xl border border-base-300 p-8 shadow-lg">
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-bold text-pink-400">Yıllık İzin Durumu</h3>
                    <div className="text-right">
                      <p className="text-xs text-base-content/50">Sonraki Hakediş Tarihi</p>
                      <p className="font-bold text-base-content/80">{nextLeaveDate.toLocaleDateString('tr-TR')} <span className="text-emerald-400">(+{nextLeaveDays} Gün)</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#16191d] p-5 rounded-xl border border-base-300">
                      <p className="text-xs text-base-content/60 font-bold mb-1">Mevcut Kıdem</p>
                      <p className="text-3xl font-bold text-base-content">{yearsWorked} <span className="text-lg">Yıl</span></p>
                    </div>
                    <div className="bg-[#16191d] p-5 rounded-xl border border-base-300">
                      <p className="text-xs text-base-content/60 font-bold mb-1">Yasal Toplam Hakediş</p>
                      <p className="text-3xl font-bold text-emerald-400">{earnedLeave} <span className="text-lg">Gün</span></p>
                    </div>
                    <div className="bg-[#16191d] p-5 rounded-xl border border-base-300">
                      <p className="text-xs text-base-content/60 font-bold mb-1">Toplam Kullanılan</p>
                      <p className="text-3xl font-bold text-warning">{totalUsedLeave} <span className="text-lg">Gün</span></p>
                    </div>
                    <div className="bg-pink-900/10 p-5 rounded-xl border border-pink-500/30 ring-2 ring-pink-500/20">
                      <p className="text-xs text-pink-400/80 font-bold mb-1">Kalan Net İzin Bakiyesi</p>
                      <p className="text-3xl font-black text-pink-400">{remainingLeave} <span className="text-lg">Gün</span></p>
                    </div>
                  </div>
                </div>

                {/* BAKİYE EŞİTLEME PANELİ */}
                <div className="bg-[#16191d] rounded-xl border border-base-300 p-6 shadow-md flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-base-content mb-1">Bakiye Eşitleme Aracı</h4>
                    <p className="text-sm text-base-content/60">
                      Eğer sistemdeki kalan izniniz gerçekle uyuşmuyorsa, şirketinize sorarak öğrendiğiniz <strong>güncel kalan izin bakiyenizi</strong> girin. Sistem geçmiş kullanımlarınızı otomatik olarak hesaplayıp veritabanını eşitleyecektir.
                    </p>
                  </div>
                  <div className="flex-1 w-full flex flex-col gap-2">
                    <div className="flex gap-2 w-full">
                      <input
                        type="number"
                        min="0"
                        className="input p-2 input-bordered bg-base-200 flex-1 focus:ring-2 focus:ring-pink-500"
                        placeholder="Şu anki gerçek bakiyem (Gün)"
                        value={knownLeaveBalance}
                        onChange={(e) => setKnownLeaveBalance(e.target.value)}
                      />
                      <button
                        className="btn p-4 bg-pink-600 hover:bg-pink-700 text-white border-none"
                        onClick={() => saveLeaveBalance(earnedLeave)}
                        disabled={isSavingLeave || knownLeaveBalance === ''}
                      >
                        {isSavingLeave ? <span className="loading loading-spinner"></span> : 'Eşitle'}
                      </button>
                      <button
                        className="btn p-4 bg-red-600 hover:bg-red-700 text-white border-none"
                        title="Sistemi varsayılan yasal hakedişe döndürür"
                        onClick={() => resetLeaveBalance()}
                        disabled={isSavingLeave}
                      >
                        Sıfırla
                      </button>
                    </div>
                    {leaveFeedback && (
                      <div className={`p-2 rounded-lg text-xs font-bold text-center animate-fade-in ${leaveFeedback.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {leaveFeedback.message}
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* TAZMİNAT SEKME İÇERİĞİ */}
      {activeTab === 'tazminat' && (
        <div className="w-full max-w-5xl space-y-6 animate-fade-in">
          <div className="bg-[#1e2329] rounded-xl border border-base-300 p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 print:hidden">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-amber-400 mb-2">Tazminat Motoru</h3>
                <p className="text-sm text-base-content/60">İşe giriş tarihiniz ve belirlediğiniz çıkış tarihine göre yasal kıdem ve ihbar tazminatınızı net olarak hesaplar.</p>
              </div>
              <div className="flex-1 flex flex-col gap-3 bg-[#16191d] p-4 rounded-xl border border-base-300">
                <div className="form-control w-full">
                  <label className="label py-1"><span className="label-text font-bold text-base-content/80">İşten Çıkış / Ayrılış Tarihi</span></label>
                  <input
                    type="date"
                    className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-amber-500"
                    value={terminationDate}
                    onChange={(e) => setTerminationDate(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-amber"
                    checked={payNotice}
                    onChange={(e) => setPayNotice(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-base-content/80">İhbar süresi kullandırılmadı (Tazminat ödensin)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#16191d] p-5 rounded-xl border border-base-300">
                <h4 className="font-bold text-base-content/70 mb-4 border-b border-base-300 pb-2">Kıdem Tazminatı</h4>
                <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Çalışılan Süre:</span> <span className="font-bold">{severanceData.yearsWorked.toFixed(2)} Yıl</span></div>
                <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Brüt Kıdem:</span> <span className="font-bold">{severanceData.severanceGross.toFixed(2)} ₺</span></div>
                <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Damga Vergisi Kesintisi:</span> <span className="text-red-400">-{severanceData.severanceStampTax.toFixed(2)} ₺</span></div>
                <div className="flex justify-between text-lg mt-4 pt-2 border-t border-base-300"><span className="font-bold text-amber-500">Net Kıdem:</span> <span className="font-black text-amber-400">{severanceData.severanceNet.toFixed(2)} ₺</span></div>
                {severanceData.yearsWorked < 1 && <p className="text-xs text-error mt-2">1 tam yılı doldurmadığınız için kıdem tazminatına hak kazanamazsınız.</p>}
              </div>

              <div className={`bg-[#16191d] p-5 rounded-xl border border-base-300 ${!payNotice ? 'opacity-40 grayscale' : ''}`}>
                <h4 className="font-bold text-base-content/70 mb-4 border-b border-base-300 pb-2">İhbar Tazminatı</h4>
                <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">İhbar Süresi:</span> <span className="font-bold">{severanceData.noticeWeeks} Hafta</span></div>
                <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Brüt İhbar:</span> <span className="font-bold">{severanceData.noticeGross.toFixed(2)} ₺</span></div>
                <div className="flex justify-between text-sm mb-2"><span className="text-base-content/60">Vergi (GV + DV):</span> <span className="text-red-400">-{(severanceData.noticeIncomeTax + severanceData.noticeStampTax).toFixed(2)} ₺</span></div>
                <div className="flex justify-between text-lg mt-4 pt-2 border-t border-base-300"><span className="font-bold text-amber-500">Net İhbar:</span> <span className="font-black text-amber-400">{severanceData.noticeNet.toFixed(2)} ₺</span></div>
              </div>
            </div>

            <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 text-center shadow-inner">
              <p className="text-sm font-bold text-amber-500/70 uppercase tracking-widest mb-1">Hesaba Yatacak Toplam Net Tazminat</p>
              <p className="text-5xl font-black text-amber-400">{severanceData.totalNet.toFixed(2)} ₺</p>
              <p className="text-xs text-base-content/40 mt-3">* Tavan uygulaması hesaplamaya dahil edilmemiş olup, gelir vergisi sabit %15 kabul edilmiştir.</p>
            </div>

            {/* TAZMİNAT DIŞA AKTARMA (EXPORT) BUTONLARI */}
            <div className="mt-8 bg-[#16191d] rounded-xl border border-base-300 p-6 shadow-sm animate-fade-in print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-base-content text-lg">Raporu Dışa Aktar</h4>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button onClick={exportTazminatCSV} className="btn btn-sm sm:btn-md p-3 bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white border-green-500/30 flex-1 sm:flex-none">
                    Excel (CSV)
                  </button>
                  <button onClick={() => printCalcToPDF('Tazminat')} className="btn btn-sm sm:btn-md p-3 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white border-red-500/30 flex-1 sm:flex-none">
                    Yazdır / PDF
                  </button>
                  <button onClick={exportTazminatJSON} className="btn btn-sm sm:btn-md p-3 btn-ghost bg-gray-700 border-base-300 text-base-content/60 hover:bg-base-200 flex-1 sm:flex-none">
                    JSON
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SAATLİK MAAŞ HESAP SEKME İÇERİĞİ */}
      {activeTab === 'hourly' && (
        <div className="w-full max-w-5xl bg-[#16191d] rounded-xl shadow-2xl border border-base-300 p-6 sm:p-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-sky-400 mb-2">Saatlik Ücretten Maaş Bul</h3>
              <p className="text-sm text-base-content/60 mb-6">Net veya brüt saatlik ücretinizi girin, sistem aylık maaşınızı ve katsayılarınızı oluşturup kaydetsin.</p>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setHourlyInputType('net')} className={`btn btn-sm flex-1 ${hourlyInputType === 'net' ? 'bg-sky-600 border-none text-white' : 'btn-outline border-base-300 text-base-content/70'}`}>Saatlik Net Gir</button>
                <button onClick={() => setHourlyInputType('gross')} className={`btn btn-sm flex-1 ${hourlyInputType === 'gross' ? 'bg-sky-600 border-none text-white' : 'btn-outline border-base-300 text-base-content/70'}`}>Saatlik Brüt Gir</button>
              </div>

              <div className="form-control w-full mb-4">
                <label className="input input-bordered flex items-center gap-2 bg-[#1e2329] focus-within:ring-2 focus-within:ring-sky-500 border-base-300 h-14">
                  <span className="text-sky-400 font-bold text-lg">₺</span>
                  <input
                    type="text"
                    className="grow text-lg font-bold"
                    placeholder={hourlyInputType === 'net' ? "Örn: 150 (Saatlik Net)" : "Örn: 185 (Saatlik Brüt)"}
                    value={hourlyInputValue}
                    onChange={(e) => setHourlyInputValue(e.target.value)}
                  />
                </label>
              </div>
              <button onClick={performHourlyCalculation} className="btn w-full bg-sky-600 hover:bg-sky-700 text-white border-none shadow-lg shadow-sky-900/40">
                Hesapla
              </button>

              {feedback && activeTab === 'hourly' && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-bold flex justify-center animate-fade-in ${feedback.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {feedback.message}
                </div>
              )}
            </div>

            <div className="bg-[#1e2329] rounded-xl border border-base-300 p-6 flex flex-col justify-center">
              {hourlyCalcResults ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-base-300 pb-2">
                    <span className="text-base-content/70 font-medium">Aylık Brüt Maaş:</span>
                    <span className="text-lg font-bold text-white">{hourlyCalcResults.monthlyGross} ₺</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-base-300 pb-2">
                    <span className="text-base-content/70 font-medium">Günlük Brüt (30 Gün):</span>
                    <span className="text-lg font-bold text-emerald-400">{hourlyCalcResults.dailyGross} ₺</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-base-300 pb-2">
                    <span className="text-base-content/70 font-medium">Saatlik Brüt ({settings?.base_work_hours || 7.5} Saat):</span>
                    <span className="text-lg font-bold text-sky-400">{hourlyCalcResults.hourlyGross} ₺</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-base-content/70 font-medium">Saatlik Fazla Mesai (%50):</span>
                    <span className="text-lg font-bold text-indigo-400">{hourlyCalcResults.overtimeGross} ₺</span>
                  </div>

                  <button
                    onClick={saveHourlyToSettings}
                    disabled={isSavingSettings}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/50 w-full mt-4"
                  >
                    {isSavingSettings ? <span className="loading loading-spinner"></span> : 'Sisteme Kaydet'}
                  </button>
                  <p className="text-xs text-base-content/40 text-center">* Kaydettiğinizde sistem aylık brüt tutarını otomatik hesaplayıp ayarlarınıza işler.</p>
                </div>
              ) : (
                <div className="text-center text-base-content/40 py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p>Saatlik ücretinizi yazıp hesapla butonuna basın.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ARAÇLAR SEKME İÇERİĞİ */}
      {activeTab === 'tools' && (
        <div className="w-full max-w-5xl bg-[#16191d] rounded-xl shadow-2xl border border-base-300 p-6 sm:p-8 animate-fade-in">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-indigo-400 mb-2">Maaştan Katsayı Bul & Kaydet</h3>
              <p className="text-sm text-base-content/60 mb-6">Aylık net veya brüt maaşınızı girerek günlük/saatlik katsayılarınızı sisteme otomatik kaydedin.</p>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setCalcTargetType('net')} className={`btn btn-sm flex-1 ${calcTargetType === 'net' ? 'bg-indigo-600 border-none text-white' : 'btn-outline border-base-300 text-base-content/70'}`}>Aylık Net Gir</button>
                <button onClick={() => setCalcTargetType('gross')} className={`btn btn-sm flex-1 ${calcTargetType === 'gross' ? 'bg-indigo-600 border-none text-white' : 'btn-outline border-base-300 text-base-content/70'}`}>Aylık Brüt Gir</button>
              </div>

              <div className="form-control w-full mb-4">
                <label className="input input-bordered flex items-center gap-2 bg-[#1e2329] focus-within:ring-2 focus-within:ring-indigo-500 border-base-300 h-14">
                  <span className="text-indigo-400 font-bold text-lg">₺</span>
                  <input
                    type="text"
                    className="grow text-lg font-bold"
                    placeholder={calcTargetType === 'net' ? "Örn: 33750 (Aylık Net)" : "Örn: 38811 (Aylık Brüt)"}
                    value={calcTargetValue}
                    onChange={(e) => setCalcTargetValue(e.target.value)}
                  />
                </label>
              </div>
              <button onClick={performCalculation} className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-900/40">
                Hesapla
              </button>

              {feedback && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-bold flex justify-center animate-fade-in ${feedback.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {feedback.message}
                </div>
              )}
            </div>

            <div className="bg-[#1e2329] rounded-xl border border-base-300 p-6 flex flex-col justify-center">
              {calcResults ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-base-300 pb-2">
                    <span className="text-base-content/70 font-medium">Aylık Brüt Maaş:</span>
                    <span className="text-lg font-bold text-white">{calcResults.monthlyGross} ₺</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-base-300 pb-2">
                    <span className="text-base-content/70 font-medium">Günlük Brüt (30 Gün):</span>
                    <span className="text-lg font-bold text-emerald-400">{calcResults.dailyGross} ₺</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-base-300 pb-2">
                    <span className="text-base-content/70 font-medium">Saatlik Brüt ({settings?.base_work_hours || 7.5} Saat):</span>
                    <span className="text-lg font-bold text-blue-400">{calcResults.hourlyGross} ₺</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-base-content/70 font-medium">Saatlik Fazla Mesai (%50):</span>
                    <span className="text-lg font-bold text-indigo-400">{calcResults.overtimeGross} ₺</span>
                  </div>

                  <button
                    onClick={saveToSettings}
                    disabled={isSavingSettings}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/50 w-full mt-4"
                  >
                    {isSavingSettings ? <span className="loading loading-spinner"></span> : 'Sisteme Kaydet'}
                  </button>
                  <p className="text-xs text-base-content/40 text-center">* Kaydettiğinizde veritabanında "Aylık Brüt / 30" formülü ile sistemin beyni güncellenir.</p>
                </div>
              ) : (
                <div className="text-center text-base-content/40 py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  <p>Maaşınızı yazıp hesapla butonuna basın.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}