// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import webPush from "npm:web-push"

// Supabase Dashboard'a kaydettiğimiz gizli anahtarları çekiyoruz
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

// Kendi e-posta adresini buraya yazıyorsun (Web Push standardı gereği zorunludur)
webPush.setVapidDetails(
  'mailto:m3rt7132@gmail.com',
  vapidPublicKey,
  vapidPrivateKey
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // CORS kontrolü (Tarayıcı güvenlik önlemi)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // React'ten veya Veritabanı Otomasyonundan (Cron) gelen veriyi oku
    const { subscription, payload } = await req.json()

    if (!subscription) {
      throw new Error('Abonelik (Subscription) verisi bulunamadı.')
    }

    // Bildirimi Cihaza Fırlat!
    await webPush.sendNotification(subscription, JSON.stringify(payload))

    return new Response(
      JSON.stringify({ success: true, message: 'Bildirim başarıyla gönderildi.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Bildirim gönderme hatası:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})