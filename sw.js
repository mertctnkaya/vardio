// public/sw.js

// 1. Arka planda gelen bildirimi yakalama (Push Event)
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.message,
      icon: '/icon-192x192.png', // Varsa logonu koy, yoksa boş kalabilir
      badge: '/badge-icon.png',  // Varsa bildirim çubuğu ikonun
      vibrate: [100, 50, 100],   // Telefonda titreşim ritmi
      data: {
        url: data.url || '/'     // Bildirime tıklanınca gidilecek adres
      },
      requireInteraction: false   // Kullanıcı tıklayana veya kapatana kadar ekranda kalır
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 2. Bildirime tıklandığında yapılacak işlem (Notification Click Event)
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Bildirimi kapat

  const urlToOpen = event.notification.data.url;

  // Kullanıcı zaten sitemizdeyse o sekmeye odaklan, değilse yeni sekme aç
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});