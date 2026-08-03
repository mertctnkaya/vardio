# 🏭 Vardiyo - Akıllı Bordro ve Mesai Asistanı

Selamlar. 

Ağır sanayide, üretim bantlarında veya vardiyalı herhangi bir sistemde çalıştıysanız şu hissi çok iyi bilirsiniz: Ay sonu gelir, bordro elinize geçer ve saatlerce *“Gece zammını doğru yatırmışlar mı?”, “Vergi dilimi beni ne kadar kesmiş?”, “2 gün raporluydum, maaştan ne kadar gider?”* diye hesap yapmaya çalışırsınız. Piyasada ya çok kısıtlı hesap yapan basit uygulamalar var ya da sadece İK uzmanlarının anlayabileceği karmaşık devasa yazılımlar...

İşte **Vardiyo** tam olarak bu sorunu çözmek için doğdu. Bir işçinin / çalışanın maaşını, yasal haklarını ve çalışma takvimini kimseye sormadan, tamamen Türkiye Cumhuriyeti İş Kanunu standartlarında **kuruşu kuruşuna** takip edebilmesi için geliştirilmiş modern bir web uygulamasıdır. 

Hem samimi hem de arka planda deli gibi matematik yapan bir asistan arıyorsanız, doğru yerdesiniz.

---

## 🚀 Neler Yapabiliyor? (Ana Özellikler)

### 💰 1. Gerçekçi Bordro Motoru (Şakasız, Kuruşu Kuruşuna)
Uygulamanın kalbi burası. Sadece "Aylık netin bu" deyip geçmez. Tıpkı şirketinizin muhasebesi gibi çalışır:
* SGK İşçi Primi (%14), İşsizlik Primi (%1), Kümülatif Gelir Vergisi matrahı ve Damga Vergisi kesintilerini milimetrik hesaplar.
* **Gece Zammı Optimizasyonu:** Yasal gece çalışma saatlerini (20:00 - 06:00 arası) baz alarak dakika dakika gece primi hakedişinizi bulur.
* Fazla mesailer, bayram (resmi tatil) çalışmaları, ücretsiz izin/devamsızlık kesintileri ve BES kesintilerini tek ekranda toplayıp o ay **hesabınıza yatacak net parayı** karşınıza çıkarır.

### 📅 2. Vardiya Döngüsü ve Akıllı Takvim
* *“Acaba 15 gün sonra hangi vardiyadayım?”* derdine son. Ayarlar kısmından döngünüzü (örneğin 3'lü vardiya) ve başlangıç noktanızı bir kere girersiniz, sistem gelecekteki sonsuz takviminizi otomatik oluşturur.
* Takvim üzerinden tek tıkla devamsızlık, yıllık izin, fazla mesai veya rapor girebilirsiniz. Siz takvimi doldurdukça, arka plandaki bordro motoru maaşınızı anlık olarak günceller.

### 🏖️ 3. Yıllık İzin ve Tazminat Hesaplayıcı
* **Kıdem & İhbar:** İşe giriş tarihinizi ve ayrılacağınız tarihi girin. 1 tam yılı doldurup doldurmadığınıza bakar, brüt maaşınız üzerinden damga ve gelir vergilerini düşerek elinize geçecek net kıdem ve ihbar tazminatını hesaplar.
* **İzin Bakiyesi:** Kaç yıllık çalışan olduğunuza göre yasal yıllık izin hakedişinizi (14, 20, 26 gün) hesaplar. Kullandıklarınızı düşer ve size "Şu an net X gün iznin var" der.

### 📚 4. İşçi Hakları ve S.S.S. Bilgi Bankası
Kullanıcıların haklarını öğrenmesi için devasa bir bilgi bankası. 
* İhbar süresinde iş arama izni, mazeret izinleri, tazminatsız çıkış halleri, AGİ, EYT, işsizlik maaşı şartları gibi İş Kanunu ve SGK mevzuatında en çok merak edilen onlarca hap bilgi. Üstelik entegre arama motoru ile saniyeler içinde ulaşılabilir.

### 🛠️ 5. Pratik Araçlar (Saatlikten Net Bulma)
* *“Benim saatliğim 172 TL, aylık netim ne olur?”* veya *“Aylık netim 35.000 TL, günlüğüm neye gelir?”* diye uğraşmayın. Brüt-Net, Saatlik-Aylık dönüştürücü motorlara rakamı yazın, sistem oranlarınızı ayarlayıp hesabınıza (veritabanına) otomatik işlesin.

---

## 🔒 Güvenlik & Teknoloji Altyapısı

Vardiyo sadece ön yüzü güzel bir hesap makinesi değil, bulut tabanlı bir SaaS (Software as a Service) mimarisidir.

* **Tech Stack:** React, TypeScript, Tailwind CSS, Supabase (PostgreSQL).
* **Veri Güvenliği (Kriptolu Altyapı):** Girdiğiniz mesailer cihazınızın tarayıcısında (Local Storage) tutulmaz. Telefonunuz bozulsa bile e-postanızla giriş yapıp kaldığınız yerden devam edebilirsiniz.
* **Sıkıyönetim (RLS):** Supabase üzerinde uygulanan "Row Level Security" kuralları sayesinde, veritabanına doğrudan bağlantı sağlansa dahi kimse başkasının vardiyasını, maaş ayarını veya iletişim mesajlarını göremez.

---

## 💡 Gelecek Yol Haritası (Roadmap)
- [ ] Rapor Parası (Geçici İş Göremezlik Ödeneği) simülatörü.
- [ ] İşsizlik maaşı (Ne kadar süre / ne kadar maaş) hesaplayıcı.
- [ ] Toplu İş Sözleşmesi (TİS) ve MESS standartlarına özel yakacak, bayram ve erzak yardımı entegrasyonu.
- [ ] Enflasyon ve zam senaryosu simülatörü.
- [ ] PWA & React Native ile native mobil uygulama geçişi.

---

**Geliştirici Notu:** 
Kodlar temiz, mimari esnek, tasarım ise kullanıcıyı yormayan koyu bir temaya (Dark Mode) sahiptir. Kod okumaktan, vergi dairesi mevzuatlarından ve mesai saatlerini hesaplamaktan beyni yanmış herkese bir nefes aldırması dileğiyle. 

Hızlıca herhangi bir şey için ulaşmak isterseniz; Instagram @merutou
Selam vermek isterseniz de müsaitim!

Keyifli kullanımlar!