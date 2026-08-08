import StatCard from '../shared/StatCard';
import Alert from '../shared/Alert';
import type { StatsTabProps } from '../../types';

export default function StatsTab({ stats }: StatsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2 animate-fade-in">
      <StatCard title="Aktif Profiller" value={stats.usersCount} desc="Ayarlarını kaydeden tekil kullanıcı sayısı" colorTheme="white" iconName="users" />
      <StatCard title="Girilen Mesailer" value={stats.logsCount} desc="Takvime işlenmiş toplam gün/vardiya" colorTheme="emerald" iconName="calendar" />
      <StatCard title="Hatırlatıcılar" value={stats.remindersCount} desc="Kullanıcıların eklediği toplam not/hatırlatma" colorTheme="orange" iconName="bell" />

      <div className="md:col-span-3 mt-4">
        <Alert color="amber" title="Yönetici Notu" icon="info" bgStyle="colored" borderStyle="colored">
          Kullanıcıların şifreleri, e-posta adresleri ve kimlik doğrulama ayarları güvenliğiniz gereği sadece <strong className="text-white">Supabase Dashboard</strong> üzerinden yönetilebilir. Ön yüzden sadece kullanıcı davranışlarını, mesajları ve premium yetkilerini takip edebilirsiniz.
        </Alert>
      </div>
    </div>
  );
}