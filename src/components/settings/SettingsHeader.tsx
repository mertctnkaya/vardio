import Alert from '../shared/Alert';

export default function SettingsHeader() {
  return (
    <>
      <div className="bg-base-200 border-b border-base-300 p-6">
        <h2 className="text-2xl font-bold text-base-content">Sistem ve Bordro Ayarları</h2>
        <p className="text-sm text-base-content/60 mt-1">İşletmenizin kurallarına göre uygulamanın beynini yapılandırın.</p>
      </div>

      <div className="px-6 pt-6 sm:px-8">
        <Alert color="indigo" borderStyle="colored" className="mb-6" title="Önemli İpuçları" icon="info">
          <ul className="list-disc list-inside space-y-1.5 opacity-90">
            <li><strong className="text-indigo-300">Tarihler:</strong> İşe giriş tarihi takvim içindir, net tarih gerekli değildir. Döngü için geçmişteki işe başladıktan sonraki ilk Gündüz pazartesi gününü seçmelisiniz.</li>
            <li><strong className="text-indigo-300">Normal Çalışma Saati:</strong> Çay ve yemek molalarını <em>çıkararak</em> sadece net çalıştığınız süreyi yazmalısınız. (Örn: 7.5)</li>
            <li><strong className="text-indigo-300">Aylık Brüt Maaş:</strong> Sistemin ana motorudur. Lütfen net değil, sözleşmenizdeki <strong className="text-white">Brüt Tutarı</strong> yazın. Brüt bilmiyorsanız Hesaplamalar sekmesinden "Katsayı Bul" aracını kullanın.</li>
          </ul>
        </Alert>
      </div>
    </>
  );
}