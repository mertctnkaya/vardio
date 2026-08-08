import Alert from '../shared/Alert';

export default function UsageTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">Vardiyo'ya Nereden Başlamalıyım?</h3>

      <p className="text-base-content/80 leading-relaxed mb-6">
        Uygulamamız her yaştan çalışanın rahatça anlayabilmesi için adım adım tasarlanmıştır. Maaşınızı, mesailerinizi ve vardiyanızı tamamen size özel takip edebilmek için şu basit 5 adımı izlemeniz yeterlidir:
      </p>

      <div className="space-y-4">
        <div className="flex gap-4 items-start bg-base-200 p-4 rounded-xl border border-base-300 shadow-sm">
          <div className="w-8 h-8 shrink-0 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-lg">1</div>
          <div>
            <h4 className="font-bold text-base-content text-lg">Hesap Oluşturun</h4>
            <p className="text-sm text-base-content/70 mt-1">Girdiğiniz mesailerin ve maaş bilgilerinizi cihazınız bozulsa dahi kaybetmemek için sağ üstten <strong>Kayıt Ol</strong> butonuna basarak ücretsiz hesabınızı açın.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start bg-base-200 p-4 rounded-xl border border-base-300 shadow-sm">
          <div className="w-8 h-8 shrink-0 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-lg">2</div>
          <div>
            <h4 className="font-bold text-base-content text-lg">Net/Brüt Maaşınızı Dönüştürün (Zorunlu Değil)</h4>
            <p className="text-sm text-base-content/70 mt-1">Bordro hesaplamaları yasal olarak Brüt maaş üzerinden yapılır. Eğer sadece "Aylık Net" veya "Saatlik Ücretinizi" biliyorsanız; <strong>Hesaplamalar</strong> menüsünden <strong>Saatlikten Bul</strong> veya <strong>Araçlar (Aylıktan)</strong> sekmelerine giderek elinizdeki tutarı yazın. Sistem Brüt maaşınızı otomatik bulup kaydedecektir.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start bg-base-200 p-4 rounded-xl border border-base-300 shadow-sm">
          <div className="w-8 h-8 shrink-0 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-lg">3</div>
          <div>
            <h4 className="font-bold text-base-content text-lg">Sistemin Beynini Doldurun (Ayarlar)</h4>
            <p className="text-sm text-base-content/70 mt-1"><strong>Ayarlar</strong> sekmesine girin. Burası uygulamanın beynidir. Vardiya sisteminiz (Örn: 3'lü vardiya), saatleriniz ve maaşınız burada tutulur. Buradaki döngü tarihini geçmişte "Gündüz (Pazartesi)" vardiyasında olduğunuz herhangi bir tarih olarak seçmelisiniz.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start bg-base-200 p-4 rounded-xl border border-base-300 shadow-sm">
          <div className="w-8 h-8 shrink-0 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-lg">4</div>
          <div>
            <h4 className="font-bold text-base-content text-lg">Takvimi Doldurmaya Başlayın</h4>
            <p className="text-sm text-base-content/70 mt-1"><strong>Mesai Takvimim</strong> sekmesini açın. Geç kaldığınızda, fazla mesaiye kaldığınızda veya yıllık izin kullandığınızda o günün kutucuğuna tıklayıp kaydedin. Geri kalan tüm vardiya ve çalışma günlerinizi sistem otomatik doldurur.</p>
            <div className="mt-6">
              <Alert color="amber" title="Uyarı" icon="warning" borderStyle="colored" bgStyle="colored">
                Takvime yasal sınırı aşacak şekilde devamsızlık girerseniz, sistem sizi tazminat riski konusunda takvim altında uyaracaktır.
              </Alert>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/30 shadow-sm">
          <div className="w-8 h-8 shrink-0 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-lg">5</div>
          <div>
            <h4 className="font-bold text-emerald-400 text-lg">Sonuç: Kusursuz Bordronuzu Görün</h4>
            <p className="text-sm text-base-content/70 mt-1"><strong>Hesaplamalar &rarr; Aylık Bordro</strong> sekmesine girdiğinizde, işaretlediğiniz mesailer, tatiller ve gece saatleriyle beraber o ay hesabınıza yatacak net tutarı kuruşu kuruşuna görebilirsiniz.</p>
          </div>
        </div>
      </div>

      <Alert color="yellow" title="Daha Meraklıları İçin: Arka Planda Neler Dönüyor?" borderStyle="left-colored" bgStyle="colored" icon="info">
        <div className="space-y-4 text-sm text-yellow-100/80 leading-relaxed">
          <p><strong>Döngü Tarihi Neden Önemli?</strong> Sistem, sonsuz bir takvimi hafızasında tutmaz. Sizin Ayarlar'da verdiğiniz "Gündüz" tarihini "0 noktası" kabul eder. Bugüne kadarki aradaki gün farkını bulur, vardiya döngünüze (2'li veya 3'lü) böler ve o gün hangi vardiyada olduğunuzu matematiksel formüllerle anında hesaplar.</p>
          <p><strong>Gece Saatleri ve Mola Algoritması:</strong> İş Kanununa göre 20:00 - 06:00 arası gece sayılır. Sistem sizin başlangıç ve bitiş saatlerinizi bu aralıkla çakıştırır. Geceye denk gelen süreyi dakika dakika hesaplar. 4 saati geçen gece çalışmalarında yarım saatlik yemek molasını hakedişten otomatik düşer.</p>
          <p><strong>Bordro Motoru Kümülatif Çalışır:</strong> Basit maaş hesaplama sitelerinin aksine, bu sistem her ayı yaşanmış günleri baz alarak (geleceğin parasını yatırmadan) hesaplar. SGK İşçi (%14), İşsizlik (%1) kesintilerinden sonra, yasal Vergi Matrahınızı bulur. Asgari ücret Damga ve Gelir Vergisi istisnalarını düşarak net maaşınıza ulaşır.</p>
          <p><strong>Yıllık İzin Geçmiş Eşitlemesi:</strong> Siz sisteme "Benim 14 gün iznim kaldı" dediğinizde, sistem işe giriş tarihinize bakıp "Bu kişi yasal olarak 56 gün izin hak etmiş olmalı, demek ki geçmişte 42 gününü kullanmış" diyerek arka planda eksik günlerinizi veritabanına otomatik eşitler.</p>
          <p><strong>Verileriniz Nasıl Korunuyor?</strong> Bilgileriniz basit bir tarayıcı hafızasında (LocalStorage) tutulmaz. Google'ın bulut standartlarında olan Supabase sunucularında, e-posta adresinize bağlanan 64 karakterlik kriptolu kimliklerle (UUID) şifrelenir. Sistemde aktif Row Level Security (Satır Güvenliği) bulunduğu sürece yönetici dahi şifrenizi öğrenemez.</p>
        </div>
      </Alert>
    </div>
  );
}