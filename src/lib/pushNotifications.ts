import { supabase } from './supabaseClient';

// VAPID Public Key (Bunu .env dosyasından alacağız)
const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Base64 güvenlik anahtarını tarayıcının anlayacağı formata çeviren yardımcı fonksiyon
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerAndSubscribeToPush(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Tarayıcınız anlık bildirimleri desteklemiyor (iOS Safari kullanıyorsanız ana ekrana eklemeniz gerekebilir).');
    return null;
  }

  try {
    // 1. Service Worker'ı kaydet
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker başarıyla kaydedildi.');

    // 2. Kullanıcıdan izin iste
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return permission;
    }

    // 3. VAPID anahtarı kontrolü
    if (!publicVapidKey) {
      console.error('VAPID Public Key eksik! .env dosyanızı kontrol edin.');
      return permission;
    }

    // 4. Tarayıcıyı Push servisine abone yap
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    // 5. Alınan o özel adresi (Token) Supabase'e kaydet
    const { error } = await supabase
      .from('user_settings')
      .update({ push_subscription: JSON.parse(JSON.stringify(subscription)) })
      .eq('user_id', userId);

    if (error) {
      console.error('Push aboneliği veritabanına kaydedilemedi:', error);
    } else {
      console.log('Cihaz başarıyla bildirim sistemine kaydedildi!');
    }

    return permission;

  } catch (error) {
    console.error('Push aboneliği sırasında hata oluştu:', error);
    return null;
  }
}

export async function sendTestNotification(userId: string) {
  try {
    // 1. Kullanıcının cihaz adresini veritabanından çek
    const { data, error } = await supabase
      .from('user_settings')
      .select('push_subscription')
      .eq('user_id', userId)
      .single();

    if (error || !data?.push_subscription) {
      alert("Cihaz aboneliği bulunamadı. Lütfen önce bildirim izni verin.");
      return;
    }

    // 2. Supabase Edge Function'ı tetikle (Postacıya mektubu ver)
    const { error: funcError } = await supabase.functions.invoke('send-push', {
      body: {
        subscription: data.push_subscription,
        payload: {
          title: "🚀 Test Başarılı!",
          message: "Vardiyo bildirim sistemi cihazınızda kusursuz çalışıyor.",
          url: "/settings"
        }
      }
    });

    if (funcError) {
      console.error("Postacı (Edge Function) hatası:", funcError);
      alert("Bildirim gönderilemedi. Konsolu kontrol edin.");
    } else {
      console.log("Mektup postacıya teslim edildi!");
    }
  } catch (err) {
    console.error("Test sırasında beklenmeyen hata:", err);
  }
}