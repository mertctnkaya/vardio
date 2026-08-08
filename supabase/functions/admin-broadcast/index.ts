// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import webPush from "npm:web-push"

const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

webPush.setVapidDetails(
  'mailto:m3rt7132@gmail.com',
  vapidPublicKey,
  vapidPrivateKey
)

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, message } = await req.json()

    if (!title || !message) {
      throw new Error('Başlık ve mesaj zorunludur.')
    }

    // DİKKAT: Veritabanına kayıt yapabilmek için 'user_id' sütununu da çekiyoruz
    const { data: users, error } = await supabase
      .from('user_settings')
      .select('user_id, push_subscription, notification_preferences')
      .not('push_subscription', 'is', null)

    if (error) throw error

    let sentCount = 0;
    const dbNotifications = []; // Veritabanına eklenecek bildirimler havuzu

    for (const user of users) {
      const prefs = user.notification_preferences || {};
      
      if (prefs.app_updates) {
        // 1. Cihaza Push At
        await webPush.sendNotification(user.push_subscription, JSON.stringify({
          title: title,
          message: message,
          url: "/" 
        })).catch(e => console.log('Gönderim hatası:', e));
        
        // 2. Uygulama İçi (Dropdown) Bildirim Havuzuna Ekle
        dbNotifications.push({
          user_id: user.user_id,
          type: 'broadcast',
          title: title,
          message: message,
          link: '/',
          is_interactive: true
        });

        sentCount++;
      }
    }

    // Döngü bitince tüm bildirimleri TEK SEFERDE veritabanına yaz (Performans/5S)
    if (dbNotifications.length > 0) {
      const { error: dbError } = await supabase.from('notifications').insert(dbNotifications);
      if (dbError) console.error("Veritabanı kayıt hatası:", dbError);
    }

    return new Response(JSON.stringify({ success: true, sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})