import Alert from '../shared/Alert';
import type { PremiumTabProps } from '../../types';

export default function PremiumTab({ users, actionFeedback, onGrantPremium, onDeleteAccount }: PremiumTabProps) {
  return (
    <div className="w-full bg-[#16191d] rounded-xl shadow-2xl border border-base-300 overflow-hidden px-2 sm:px-0 animate-fade-in">
      {actionFeedback && (
        <div className="mb-4">
          <Alert 
            color={actionFeedback.includes('Hata') ? 'red' : 'emerald'}
            title={actionFeedback.includes('Hata') ? 'Hata' : 'Başarılı'} 
            icon={actionFeedback.includes('Hata') ? "warning" : "check"} 
            bgStyle="colored" 
            borderStyle="colored"
          >
            {actionFeedback}
          </Alert>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table w-full text-left">
          <thead className="bg-[#1e2329] text-base-content/70">
            <tr>
              <th className="py-4 px-4">Kullanıcı (E-posta)</th>
              <th>Rol</th>
              <th>Premium Durumu</th>
              <th className="text-right px-4">Aksiyonlar</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isPremium = u.premium_until && new Date(u.premium_until) > new Date();
              const premiumDate = isPremium ? new Date(u.premium_until!).toLocaleDateString('tr-TR') : 'Yok';

              return (
                <tr key={u.id} className="border-b border-base-300/50 hover:bg-base-200/50 transition-colors">
                  <td className="py-4 px-4 font-medium">{u.email}</td>
                  <td>
                    {u.role === 'admin' ? (
                      <span className="badge badge-error badge-outline gap-1">Kurucu</span>
                    ) : (
                      <span className="badge badge-ghost text-base-content/50">Üye</span>
                    )}
                  </td>
                  <td>
                    {isPremium ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                        {premiumDate}
                      </span>
                    ) : (
                      <span className="text-base-content/30 text-sm">Ücretsiz</span>
                    )}
                  </td>
                  <td className="text-right px-4 space-x-2 whitespace-nowrap">
                    {u.role !== 'admin' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onGrantPremium(u.id, 1)} className="btn btn-sm px-3 bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white border-none">1 Ay Ver</button>
                        <button onClick={() => onGrantPremium(u.id, 999)} className="btn btn-sm px-3 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border-none">Sınırsız</button>
                        <button onClick={() => onGrantPremium(u.id, 0)} className="btn btn-sm px-3 bg-red-400/20 text-red-400 hover:bg-red-500 hover:text-white border-none" title="Premium yetkisini geri alır">
                          Premium İptal
                        </button>
                        <button onClick={() => onDeleteAccount(u.id, u.email)} className="btn btn-sm px-3 bg-red-950/80 text-red-300 hover:bg-red-700 hover:text-white border border-red-800/50 shadow-sm" title="Kullanıcıyı sistemden kalıcı olarak siler">
                          Hesabı Sil
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-base-content/50">Kayıtlı kullanıcı bulunamadı.</div>
        )}
      </div>
    </div>
  );
}