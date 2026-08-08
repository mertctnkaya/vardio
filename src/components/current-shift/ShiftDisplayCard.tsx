import type { ShiftDisplayCardProps } from '../../types/currentShift';

export default function ShiftDisplayCard({ currentShift, shiftHours }: ShiftDisplayCardProps) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body items-center justify-center text-center">
        <h2 className="card-title text-base-content/80 mb-2">
          Güncel Vardiya
        </h2>

        {/* Vardiya İsmi (Örn: 08:00 - 16:00 Gündüz) */}
        <div className="text-4xl font-black text-primary mt-4 mb-1">
          {currentShift.name}
        </div>

        {/* Vardiya Saatleri */}
        {currentShift.id !== -1 && shiftHours && (
          <div className="text-lg font-bold text-base-content/60 mb-2 bg-base-200 px-3 py-1 rounded-md border border-base-300">
            {shiftHours}
          </div>
        )}

        {/* Tatil veya Özel Durum Notları */}
        {currentShift.note && (
          <div className="mt-3 font-bold px-4 py-2 rounded-lg bg-error/20 text-error border border-error/50">
            {currentShift.note}
          </div>
        )}
      </div>
    </div>
  );
}