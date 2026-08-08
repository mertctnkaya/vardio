import Alert from '../shared/Alert';

export default function RightsTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">Temel Yasal Haklarınız</h3>

      <Alert color="red" title="Tazminatsız Çıkış (Haklı Fesih) Halleri" borderStyle="left-colored" bgStyle="colored" icon="none">İş Kanunu Madde 25'e göre; işçinin işverenden izin almaksızın <strong>ardı ardına 2 gün</strong> veya bir ayda <strong>toplam 3 gün</strong> işe gitmemesi durumunda işveren işçiyi kıdem tazminatı ödemeden işten çıkarabilir.</Alert>
      <Alert color="red" title="Kıdem Tazminatı" borderStyle="colored" bgStyle="colored" icon="none">Aynı işverene bağlı olarak en az 1 tam yıl çalışmış işçi haklı sebeplerle işten çıkarıldığında veya kendi haklı sebebiyle ayrıldığında, çalıştığı her tam yıl için <strong>30 günlük brüt ücreti</strong> tutarında kıdem tazminatı alır. (Yalnızca binde 7,59 damga vergisi kesilir).</Alert>
      <Alert color="amber" title="İhbar Tazminatı" borderStyle="colored" bgStyle="colored" icon="none">İşveren sizi işten çıkarmadan önce çalışma sürenize göre önceden haber vermek zorundadır (6 aya kadar 2 hafta, 3 yıldan fazlaysa 8 hafta vb.). Eğer bu süreyi size kullandırmayıp hemen işten çıkarırsa, bu haftaların ücretini peşin olarak (Gelir + Damga vergisi kesilerek) ödemek zorundadır.</Alert>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Alert color="emerald" title="Fazla Mesai Ücreti" borderStyle="colored" bgStyle="colored" icon="none">Haftalık 45 saati aşan her çalışma fazla mesaidir ve saat ücreti normal ücretin <strong>%50 fazlası (1.5 katı)</strong> ödenir. Fazla mesaiye kalınan günler için ayrıca yemek ve yol ücreti de ödenmelidir.</Alert>
        <Alert color="yellow" title="Resmi Tatil Mesaisi" borderStyle="colored" bgStyle="colored" icon="none">Ulusal bayram ve genel tatil günlerinde çalışan işçiye, çalışmadan hak ettiği 1 günlük ücrete ek olarak <strong>+1 yevmiye daha</strong> ödenir (Toplam 2 yevmiye).</Alert>
        <Alert color="pink" title="Yıllık İzin Hakkı" borderStyle="colored" bgStyle="colored" icon="none">İşçinin yıllık izin hakkı, işyerindeki kıdemine göre değişir. 1 yıldan 5 yıla kadar 14 gün, 5 yıldan 15 yıla kadar 20 gün ve 15 yıldan fazla ise 26 gün ücretli izin hakkı vardır.</Alert>
        <Alert color="sky" title="Gece Mesaisi" borderStyle="colored" bgStyle="colored" icon="none">İşçilerin gece çalışmaları 7.5 saati geçemez. Vardiyanın yarısından fazlası gece saatlerine (20:00 - 06:00) denk geliyorsa tüm vardiya gece sayılır. Saat başına %1.25 katı fazlası ödenir.</Alert>
        <Alert color="indigo" title="Raporlu Günler" borderStyle="colored" bgStyle="colored" icon="none">İşçinin raporlu olduğu günlerde işveren ücret ödemek zorunda değildir. 3 gün ve üzeri raporlarda işçi parasını PTT veya Banka üzerinden SGK'dan alır. İlk 2 günün parasını kimse ödemez.</Alert>
        <Alert color="violet" title="Süt İzni" borderStyle="colored" bgStyle="colored" icon="none">Kadın işçilere 1 yaşından küçük çocuklarını emzirmeleri için günde toplam 1.5 saat süt izni verilir. Bu sürenin hangi saatlerde kullanılacağını işçi kendi belirler ve bu süre çalışılmış sayılır.</Alert>
      </div>
    </div>
  );
}