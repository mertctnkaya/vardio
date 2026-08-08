import { Link } from 'react-router-dom';
import Icon from '../shared/Icon';
import type { PayrollSectionProps } from '../../types';

export default function PayrollSection({
  monthlyGross, setMonthlyGross, displayOvertime, baseWorkHours, setBaseWorkHours, nightBonus, setNightBonus
}: PayrollSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">3. Bordro ve Ek Ödemeler</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <div className="form-control w-full">
          <label className="label"><span className="label-text font-bold text-base-content/80">Aylık Brüt Maaş (₺)</span></label>
          <label className="input input-bordered flex items-center gap-2 bg-base-200 border-indigo-500/50">
            <span className="text-indigo-400 font-bold">₺</span>
            <input type="number" className="grow font-bold text-white" value={monthlyGross} onChange={(e) => setMonthlyGross(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).select()} />
          </label>
          <Link to="/calculations" className="text-sm font-medium text-indigo-400/80 hover:text-indigo-300 mt-2 ml-1 inline-flex items-center gap-1 transition-colors">
            <Icon name="info" className="w-4 h-4" /> Brüt tutarınızı bilmiyorsanız tıklayın.
          </Link>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-base-content/80">Saatlik Mesai Ücreti (+%50)</span>
          </label>
          <label className="input input-bordered flex items-center gap-2 bg-base-300/50 border-emerald-500/30">
            <span className="text-emerald-500/80 font-bold">₺</span>
            <input type="text" className="grow font-bold text-emerald-400 pointer-events-none" value={displayOvertime} readOnly />
          </label>
          <label className="label p-1"><span className="label-text-alt text-base-content/40">Brüt maaşa göre anlık hesaplanır.</span></label>
        </div>

        <div className="form-control w-full">
          <label className="label"><span className="label-text font-bold text-base-content/80">Normal Çalışma (Saat/Gün)</span></label>
          <input type="number" step="0.5" className="input input-bordered w-full bg-base-200" value={baseWorkHours} onChange={(e) => setBaseWorkHours(e.target.value)} />
        </div>

        <div className="form-control w-full">
          <label className="label"><span className="label-text font-bold text-base-content/80">Gece Zammı Oranı (%)</span></label>
          <label className="input input-bordered flex items-center gap-2 bg-base-200">
            <span className="text-base-content/50">%</span>
            <input type="number" className="grow" value={nightBonus} onChange={(e) => setNightBonus(e.target.value)} />
          </label>
        </div>

      </div>
    </div>
  );
}