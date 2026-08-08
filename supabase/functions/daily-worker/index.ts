// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import webPush from "npm:web-push"

const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

webPush.setVapidDetails('mailto:m3rt7132@gmail.com', vapidPublicKey, vapidPrivateKey)

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const NATIONAL_HOLIDAYS = ["01-01", "04-23", "05-01", "05-19", "07-15", "08-30", "10-29"];
const HEALTH_TIPS = [
  "Gece vardiyasında kafein tüketimini sabah 04:00'ten sonra kesmeye çalışın. Gündüz uykunuzun (REM) kalitesini artırır.",
  "Sabah iş çıkışı eve dönerken güneş gözlüğü takmak, melatonin hormonunun parçalanmasını yavaşlatarak daha hızlı uykuya dalmanızı sağlar.",
  "Gece 02:00 - 04:00 arası vücut ısısı düşer ve uyku bastırır. Bu saatlerde karbonhidrat yerine hafif proteinli atıştırmalıklar enerji verir.",
  "Gündüz uyuduğunuz odanın zifiri karanlık olması (Karartma perde kullanımı), uyku verimini %60 oranında artırır.",
  "Vardiya dönüşümlerinde uyku düzenini sıfırlamak için geçiş günündeki gündüz uykusunu 3-4 saatle (kestirme) sınırlamayı deneyin."
];

serve(async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const tomorrowMonthDay = `${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

    const { data: users, error } = await supabase
      .from('user_settings')
      .select('user_id, push_subscription, notification_preferences, employment_start_date')
      .not('push_subscription', 'is', null)

    if (error) throw error

    const { data: tomorrowReminders } = await supabase.from('reminders').select('user_id, content, time_range').eq('date', tomorrowDateString).eq('is_completed', false);
    const { data: absentLogs } = await supabase.from('work_logs').select('user_id, date').eq('status', 'absent').gte('date', firstDayOfMonth);

    const absentCounts = {};
    if (absentLogs) absentLogs.forEach(log => absentCounts[log.user_id] = (absentCounts[log.user_id] || 0) + 1);

    let sentCount = 0;
    const dbNotifications = []; // Veritabanına yazılacaklar havuzu

    // Push ve DB ekleme işlemini hızlandıran yardımcı fonksiyon
    const sendAndLog = async (user_id, sub, type, title, message, link, isInteractive = true) => {
      await webPush.sendNotification(sub, JSON.stringify({ title, message, url: link })).catch(() => {});
      dbNotifications.push({ user_id, type, title, message, link, is_interactive: isInteractive });
      sentCount++;
    };

    for (const user of users) {
      const prefs = user.notification_preferences || {};
      const sub = user.push_subscription;
      const uid = user.user_id;

      if (prefs.shift_changes && today.getDay() === 0) { 
        await sendAndLog(uid, sub, 'shift', "🔄 Yarın Yeni Hafta!", "Vardiyanız değişiyor olabilir. Uyku düzeninizi ayarlamayı unutmayın.", "/", true);
      }

      if (prefs.payroll && tomorrow.getDate() === 1) { 
        await sendAndLog(uid, sub, 'payroll', "💰 Aylık Bordronuz Hazır", "Bu ayı tamamladık. Toplam hakedişinizi görmek için dokunun.", "/calculations", true);
      }

      if (prefs.holidays && NATIONAL_HOLIDAYS.includes(tomorrowMonthDay)) {
        await sendAndLog(uid, sub, 'holiday', "🎉 Yarın Resmi Tatil!", "Mesaiye kalırsanız takvime işlemeyi unutmayın, çift yevmiye yazılacak.", "/worktime", true);
      }

      if (prefs.reminders && tomorrowReminders) {
        const userRems = tomorrowReminders.filter(r => r.user_id === uid);
        if (userRems.length > 0) {
          const msgBody = userRems.length === 1 ? `${userRems[0].time_range ? '['+userRems[0].time_range+'] ' : ''}${userRems[0].content}` : `Yarın için planlanmış ${userRems.length} adet göreviniz/notunuz bulunuyor.`;
          await sendAndLog(uid, sub, 'reminder', "⏰ Yarına Dair Notunuz Var", msgBody, "/", true);
        }
      }

      if (prefs.annual_leave && user.employment_start_date) {
        const empDate = user.employment_start_date; 
        const empMonthDay = empDate.substring(5, 10);
        const empYear = parseInt(empDate.substring(0, 4));
        if (empMonthDay === todayMonthDay && today.getFullYear() > empYear) {
          const workedYears = today.getFullYear() - empYear;
          await sendAndLog(uid, sub, 'annual_leave', "🌴 Yıllık İzniniz Güncellendi!", `Tebrikler! İşyerinizde ${workedYears}. yılınızı doldurdunuz. Yeni izin haklarınızı kontrol edin.`, "/calculations", true);
        }
      }

      if (prefs.risks && absentCounts[uid] >= 2) {
        await sendAndLog(uid, sub, 'risk', "⚠️ Yasal Devamsızlık Riski!", `Bu ay ${absentCounts[uid]} gün devamsızlık girdiniz. İş Kanunu sınırına yaklaşıyorsunuz.`, "/faq", true);
      }

      if (prefs.daily_log) {
        await sendAndLog(uid, sub, 'shift', "📝 Mesainizi Girdiniz mi?", "Bugün çalıştıysanız veya mesaiye kaldıysanız takvime işlemeyi unutmayın.", "/worktime", true);
      }

      if (prefs.weekly_summary && today.getDay() === 0) {
        await sendAndLog(uid, sub, 'shift', "📊 Haftalık Raporunuz", "Bu haftayı geride bıraktık. Toplam mesai sürenizi ve istatistiklerinizi takvimden inceleyebilirsiniz.", "/worktime", true);
      }

      if (prefs.night_shift_health && (today.getDay() === 2 || today.getDay() === 5)) {
        const randomTip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
        await sendAndLog(uid, sub, 'shift', "🌙 Gece Vardiyası Asistanı", randomTip, "/faq", true);
      }
    }

    // İşlem bitince veritabanına tek seferde toplu kayıt atıyoruz
    if (dbNotifications.length > 0) {
      await supabase.from('notifications').insert(dbNotifications);
    }

    return new Response(JSON.stringify({ success: true, processedUsers: users.length, notificationsSent: sentCount }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})