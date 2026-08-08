import { useState, useEffect } from 'react';
import type { DayActionModalProps } from '../../types';
import { getLocalDateString } from '../../utils/dateUtils';
import { TURKISH_HOLIDAYS_2026 } from '../../constants/holidays';
import { saveUserWorkLog, deleteUserWorkLog } from '../../services/dbService';
import Alert from '../shared/Alert';

export default function DayActionModal({
  isOpen, onClose, selectedDay, existingLog, actualToday, user, onUpdateLog, onDeleteLog
}: DayActionModalProps) {
  
  const [logHours, setLogHours] = useState('');
  const [dayStatus, setDayStatus] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && selectedDay) {
      setDayStatus(existingLog?.status || '');
      setNoteText(existingLog?.note || '');
      setLogHours(existingLog?.hours ? existingLog.hours.toString() : '');
    }
  }, [isOpen, selectedDay, existingLog]);

  if (!isOpen) return null;

  const handleStatusChange = (status: string) => {
    setDayStatus(status);
    if (status === 'overtime') setLogHours('3');
    else if (status === 'late') setLogHours('1');
    else if (status === 'partial_leave') setLogHours('1');
    else setLogHours('');
  };

  const handleSaveLog = async () => {
    if (!user || !selectedDay) return;
    if (!dayStatus) {
      alert("Lütfen kaydetmeden önce bir 'Günlük Durum' seçin.");
      return;
    }
    setIsSaving(true);

    const dateKey = getLocalDateString(selectedDay.date);
    const payload = {
      user_id: user.id,
      log_date: dateKey,
      status: dayStatus,
      note: noteText,
      hours: Number(logHours) || 0
    };

    const { data, error } = await saveUserWorkLog(payload);

    if (!error && data) {
      onUpdateLog(dateKey, data);
      onClose();
    } else {
      alert("Kaydedilirken hata oluştu: " + error?.message);
    }
    setIsSaving(false);
  };

  const handleDeleteLog = async () => {
    if (!user || !selectedDay) return;
    setIsSaving(true);
    const dateKey = getLocalDateString(selectedDay.date);

    const { error } = await deleteUserWorkLog(user.id, dateKey);

    if (!error) {
      onDeleteLog(dateKey);
      onClose();
    } else {
      alert("Silinirken hata oluştu: " + error.message);
    }
    setIsSaving(false);
  };

  const isFutureDay = selectedDay && !selectedDay.isPast && selectedDay.date.toDateString() !== actualToday.toDateString();
  const dateKeyForSelected = selectedDay ? getLocalDateString(selectedDay.date) : '';
  const selectedHolidayName = TURKISH_HOLIDAYS_2026[dateKeyForSelected];
  const isSelectedHoliday = !!selectedHolidayName;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="bg-base-200 border border-base-300 rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>

        <h3 className="font-bold text-2xl sm:text-3xl text-primary mb-2 pr-8">
          {selectedDay?.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
        </h3>
        <p className="py-1 text-md sm:text-lg font-medium text-base-content/80">
          Vardiya: <span className="text-base-content">{selectedDay?.shiftName}</span>
        </p>
        <div className="divider my-2 opacity-50"></div>

        {isFutureDay && (
          <Alert color="indigo" borderStyle="colored" bgStyle="colored" icon="info" title="Gelecekteki Gün">
            Bu gün henüz yaşanmadı. Sadece geleceğe yönelik planlı izin veya tatil mesaisi girebilirsiniz.
          </Alert>
        )}

        {selectedHolidayName && (
            <Alert color="yellow" className="mt-4" borderStyle="colored" bgStyle="colored" title={selectedHolidayName} icon="info">
              <p className="text-xs text-yellow-100/70 mt-1">
                Bu gün resmi tatildir. Yasal olarak bu güne <strong>Yıllık İzin</strong> veya <strong>Devamsızlık</strong> yazılamaz. Bugün çalıştıysanız "Resmi Tatil Mesaisi" seçeneğini işaretleyin.
              </p>
            </Alert>
        )}
        <br></br>
        
        <div className="form-control w-full mb-6">
          <label className="label pb-2"><span className="label-text font-bold text-base-content/80">Günlük Durum</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-100 p-4 rounded-xl border border-base-300 w-full">

            <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isFutureDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-base-200'}`}>
              <input type="radio" name="status" className="radio radio-sm" disabled={isFutureDay ?? false} checked={dayStatus === 'normal'} onChange={() => handleStatusChange('normal')} />
              <span className="label-text font-medium text-base-content/90">Normal Mesai</span>
            </label>

            <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
              <input type="radio" name="status" className="radio radio-sm" disabled={isSelectedHoliday} checked={dayStatus === 'leave'} onChange={() => handleStatusChange('leave')} />
              <span className="label-text text-purple-400 font-bold">Ücretli İzinli/Raporlu</span>
            </label>

            <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
              <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#ec4899' }} disabled={isSelectedHoliday} checked={dayStatus === 'annual_leave'} onChange={() => handleStatusChange('annual_leave')} />
              <span className="label-text text-pink-400 font-bold">Yıllık İzin</span>
            </label>

            <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${!isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
              <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#fde047' }} disabled={!isSelectedHoliday} checked={dayStatus === 'holiday_work'} onChange={() => handleStatusChange('holiday_work')} />
              <span className="label-text text-yellow-300 font-bold">Resmi Tatil Mesaisi</span>
            </label>

            <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
              <input type="radio" name="status" className="radio radio-sm" disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'absent'} onChange={() => handleStatusChange('absent')} />
              <span className="label-text text-error font-bold">Devamsız / Ücretsiz</span>
            </label>

            <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isFutureDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-base-200'}`}>
              <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#10b981' }} disabled={isFutureDay ?? false} checked={dayStatus === 'overtime'} onChange={() => handleStatusChange('overtime')} />
              <span className="label-text text-emerald-500 font-bold">Fazla Mesai (+Ekstra)</span>
            </label>

            <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
              <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#f97316' }} disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'late'} onChange={() => handleStatusChange('late')} />
              <span className="label-text text-orange-500 font-bold">Geç Kaldım (Kesinti)</span>
            </label>

            <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
              <input type="radio" name="status" className="radio radio-sm" disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'partial_leave'} onChange={() => handleStatusChange('partial_leave')} />
              <span className="label-text text-sky-400 font-bold">Saatlik İzin / Erken Çıkma</span>
            </label>
          </div>
        </div>

        {['overtime', 'late', 'partial_leave'].includes(dayStatus) && (
          <div className="form-control w-full mb-4 animate-fade-in bg-base-100 p-3 rounded-lg border border-base-300">
            <label className="label pb-1">
              <span className="label-text font-bold text-base-content/90">
                {dayStatus === 'overtime' ? 'Kaç Saat Fazla Mesai Yaptınız?' :
                  dayStatus === 'late' ? 'Kaç Saat Geç Kaldınız? (Örn: 1.5)' :
                    'Kaç Saat Erken Çıktınız / İzin Aldınız?'}
              </span>
            </label>
            <label className="input input-bordered flex items-center gap-2 bg-base-200 focus-within:ring-2 focus-within:ring-primary">
              <input type="number" step="0.5" min="0" className="grow" placeholder={dayStatus === 'overtime' ? '3' : '1'} value={logHours} onChange={(e) => { const val = Number(e.target.value); if (val >= 0 || e.target.value === '') setLogHours(e.target.value); }} />
              <span className="text-base-content/50 font-bold">Saat</span>
            </label>
          </div>
        )}

        <div className="form-control w-full mb-2">
          <label className="label pb-2"><span className="label-text font-bold text-base-content/80">Detay / Not (Opsiyonel)</span></label>
          <textarea className="textarea textarea-bordered w-full min-h-[120px] bg-base-100 text-sm focus:ring-2 focus:ring-primary p-4 leading-relaxed resize-y" placeholder="Bu güne dair notlar..." value={noteText} onChange={(e) => setNoteText(e.target.value)}></textarea>
        </div>

        <div className="modal-action mt-6 flex justify-between items-center w-full">
          <div>
            {existingLog && (
              <button className="btn btn-error btn-outline" onClick={handleDeleteLog} disabled={isSaving}>
                Kaydı Temizle
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button className="btn btn-ghost hover:bg-base-300" onClick={onClose}>İptal</button>
            <button className="btn px-8 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-900/50" onClick={handleSaveLog} disabled={isSaving}>
              {isSaving ? <span className="loading loading-spinner"></span> : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}