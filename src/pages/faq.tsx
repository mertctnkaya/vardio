import { useState } from 'react';

export default function FAQ() {
    const [activeTab, setActiveTab] = useState<'usage' | 'rights' | 'faq'>('usage');

    return (
        <div className="flex flex-col items-center animate-fade-in w-full pb-10">

            <div className="w-full max-w-4xl mb-6 px-2 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-base-content">Bilgi & Haklar Rehberi</h2>
                <p className="text-base-content/60 mt-1">Sistemin kullanımı ve İş Kanunu'ndaki temel haklarınız.</p>
            </div>

            <div className="w-full max-w-4xl px-2 mb-6">
                <div className="tabs tabs-boxed bg-[#16191d] p-1 border border-base-300 flex-wrap justify-center sm:justify-start">
                    <a className={`tab tab-lg ${activeTab === 'usage' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('usage')}>Sistem Kullanımı</a>
                    <a className={`tab tab-lg ${activeTab === 'rights' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('rights')}>İşçi Hakları (Yasal)</a>
                    <a className={`tab tab-lg ${activeTab === 'faq' ? 'bg-indigo-600 text-white' : 'text-base-content/60 hover:text-white transition-colors'}`} onClick={() => setActiveTab('faq')}>S.S.S.</a>
                </div>
            </div>

            <div className="w-full max-w-4xl bg-[#16191d] rounded-xl shadow-2xl border border-base-300 p-6 sm:p-8 animate-fade-in">

                {/* === SİSTEM KULLANIMI (Adım Adım Rehber) === */}
                {activeTab === 'usage' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">Vardiyake'ye Nereden Başlamalıyım?</h3>

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
                                    <p className="text-sm text-base-content/70 mt-1">Bordro hesaplamaları yasal olarak Brüt maaş üzerinden yapılır. Eğer sadece "Aylık Net" veya "Saatlik Ücretinizi" biliyorsanız; <strong>Hesaplamalar</strong> menüsünden <strong>Saatlikten Bul</strong> veya <strong>Araçlar (Aylıktan)</strong> sekmelerine giderek elinizdeki tutarı yazın. Sistem Brüt maaşınızı otomatik bulup kaydedecektir.</p>                                </div>
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
                                    <p className="text-sm text-base-content/70 text-gray-500 mt-1">
                                        <br></br>
                                        <span className="text-red-400 font-bold">⚠️ Sistem Güvenliği:</span> Takvime yasal sınırı aşacak şekilde devamsızlık girerseniz, sistem sizi tazminat riski konusunda takvim altında uyaracaktır.
                                    </p>
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

                        {/* SARI KUTU: Meraklıları İçin */}
                        <div className="mt-8 bg-yellow-900/10 border border-yellow-500/30 rounded-2xl p-6 shadow-inner">
                            <h4 className="text-lg font-black text-yellow-500 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Daha Meraklıları İçin: Arka Planda Neler Dönüyor?
                            </h4>
                            <div className="space-y-4 text-sm text-yellow-100/80 leading-relaxed">
                                <p><strong>Döngü Tarihi Neden Önemli?</strong> Sistem, sonsuz bir takvimi hafızasında tutmaz. Sizin Ayarlar'da verdiğiniz "Gündüz" tarihini "0 noktası" kabul eder. Bugüne kadarki aradaki gün farkını bulur, vardiya döngünüze (2'li veya 3'lü) böler ve o gün hangi vardiyada olduğunuzu matematiksel formüllerle anında hesaplar.</p>

                                <p><strong>Gece Saatleri ve Mola Algoritması:</strong> İş Kanununa göre 20:00 - 06:00 arası gece sayılır. Sistem sizin başlangıç ve bitiş saatlerinizi bu aralıkla çakıştırır. Geceye denk gelen süreyi dakika dakika hesaplar. 4 saati geçen gece çalışmalarında yarım saatlik yemek molasını hakedişten otomatik düşer.</p>

                                <p><strong>Bordro Motoru Kümülatif Çalışır:</strong> Basit maaş hesaplama sitelerinin aksine, bu sistem her ayı yaşanmış günleri baz alarak (geleceğin parasını yatırmadan) hesaplar. SGK İşçi (%14), İşsizlik (%1) kesintilerinden sonra, yasal Vergi Matrahınızı bulur. Asgari ücret Damga ve Gelir Vergisi istisnalarını düşerek net maaşınıza ulaşır.</p>

                                <p><strong>Yıllık İzin Geçmiş Eşitlemesi:</strong> Siz sisteme "Benim 14 gün iznim kaldı" dediğinizde, sistem işe giriş tarihinize bakıp "Bu kişi yasal olarak 56 gün izin hak etmiş olmalı, demek ki geçmişte 42 gününü kullanmış" diyerek arka planda eksik günlerinizi veritabanına otomatik eşitler.</p>

                                <p><strong>Verileriniz Nasıl Korunuyor?</strong> Bilgileriniz basit bir tarayıcı hafızasında (LocalStorage) tutulmaz. Google'ın bulut standartlarında olan Supabase sunucularında, e-posta adresinize bağlanan 64 karakterlik kriptolu kimliklerle (UUID) şifrelenir. Sistemde aktif Row Level Security (Satır Güvenliği) bulunduğu sürece yönetici dahi şifrenizi öğrenemez.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* === İŞÇİ HAKLARI (YASAL) === */}
                {activeTab === 'rights' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">Temel Yasal Haklarınız</h3>

                        <div className="bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                            <h4 className="font-bold text-red-400 mb-1">Tazminatsız Çıkış (Haklı Fesih) Halleri</h4>
                            <p className="text-sm text-base-content/80">İş Kanunu Madde 25'e göre; işçinin işverenden izin almaksızın <strong>ardı ardına 2 gün</strong> veya bir ayda <strong>toplam 3 gün</strong> işe gitmemesi durumunda işveren işçiyi kıdem tazminatı ödemeden işten çıkarabilir.</p>
                        </div>
                        <div className="bg-amber-900/10 p-5 rounded-xl border border-amber-500/30">
                            <h4 className="font-bold text-amber-500 mb-2">Kıdem Tazminatı</h4>
                            <p className="text-sm text-base-content/70">Aynı işverene bağlı olarak en az 1 tam yıl çalışmış işçi haklı sebeplerle işten çıkarıldığında veya kendi haklı sebebiyle ayrıldığında, çalıştığı her tam yıl için <strong>30 günlük brüt ücreti</strong> tutarında kıdem tazminatı alır. (Yalnızca binde 7,59 damga vergisi kesilir).</p>
                        </div>
                        <div className="bg-amber-900/10 p-5 rounded-xl border border-amber-500/30">
                            <h4 className="font-bold text-amber-500 mb-2">İhbar Tazminatı</h4>
                            <p className="text-sm text-base-content/70">İşveren sizi işten çıkarmadan önce çalışma sürenize göre önceden haber vermek zorundadır (6 aya kadar 2 hafta, 3 yıldan fazlaysa 8 hafta vb.). Eğer bu süreyi size kullandırmayıp hemen işten çıkarırsa, bu haftaların ücretini peşin olarak (Gelir + Damga vergisi kesilerek) ödemek zorundadır.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-base-200 p-5 rounded-xl border border-base-300">
                                <h4 className="font-bold text-emerald-400 mb-2">Fazla Mesai Ücreti</h4>
                                <p className="text-sm text-base-content/70">Haftalık 45 saati aşan her çalışma fazla mesaidir ve saat ücreti normal ücretin <strong>%50 fazlası (1.5 katı)</strong> olarak ödenmek zorundadır.</p>
                            </div>
                            <div className="bg-base-200 p-5 rounded-xl border border-base-300">
                                <h4 className="font-bold text-yellow-400 mb-2">Resmi Tatiller</h4>
                                <p className="text-sm text-base-content/70">Ulusal bayram ve genel tatil günlerinde çalışan işçiye, çalışmadan hak ettiği 1 günlük ücrete ek olarak <strong>+1 yevmiye daha</strong> ödenir (Toplam 2 yevmiye).</p>
                            </div>
                            <div className="bg-base-200 p-5 rounded-xl border border-base-300">
                                <h4 className="font-bold text-pink-400 mb-2">Yıllık İzin Hakkı</h4>
                                <p className="text-sm text-base-content/70">Aynı işyerinde 1 yılı dolduranlar 14 gün, 5 yıldan fazla çalışanlar 20 gün, 15 yıl ve daha fazla çalışanlar 26 gün yıllık ücretli izin hakkı kazanır.</p>
                            </div>
                            <div className="bg-base-200 p-5 rounded-xl border border-base-300">
                                <h4 className="font-bold text-sky-400 mb-2">Gece Çalışması</h4>
                                <p className="text-sm text-base-content/70">İşçilerin gece çalışmaları 7.5 saati geçemez. Vardiyanın yarısından fazlası gece saatlerine (20:00 - 06:00) denk geliyorsa tüm vardiya gece sayılır.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* === S.S.S. === */}
                {activeTab === 'faq' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">Sıkça Sorulan Sorular</h3>

                        <div className="collapse collapse-arrow bg-base-200 border border-base-300">
                            <input type="radio" name="my-accordion-2" defaultChecked />
                            <div className="collapse-title text-base font-medium">Uygulamaya girdiğim verileri şirket görebilir mi?</div>
                            <div className="collapse-content text-sm text-base-content/70">
                                <p>Hayır. Tüm hesaplamalar kendi kişisel hesabınız üzerinden tutulur ve veritabanımız şifrelenmiştir. Şirketinizin veya başka 3. şahısların bu verilere erişimi yoktur.</p>
                            </div>
                        </div>

                        <div className="collapse collapse-arrow bg-base-200 border border-base-300">
                            <input type="radio" name="my-accordion-2" />
                            <div className="collapse-title text-base font-medium">Bordromdaki net maaş ile sistem 10-20 TL farklı çıkıyor?</div>
                            <div className="collapse-content text-sm text-base-content/70">
                                <p>Uygulamamız Türkiye standartlarına göre %99.9 oranında doğru hesaplama yapar. Ancak ufak sapmalar; firmanızın Yemek/Yol paralarını prime nasıl dahil ettiğine veya kart okutma gişelerindeki dakika yuvarlamalarına göre oluşabilir.</p>
                            </div>
                        </div>

                        <div className="collapse collapse-arrow bg-base-200 border border-base-300">
                            <input type="radio" name="my-accordion-2" />
                            <div className="collapse-title text-base font-medium">İşe gidemediğimde hafta tatili param da kesilir mi?</div>
                            <div className="collapse-content text-sm text-base-content/70">
                                <p>Kanunen evet (Mazeretsiz gidilmeyen gün + Pazar kesilir). Ancak çoğu kurumsal firma Pazar gününü ceza olarak kesmediği için motorumuz sadece gitmediğiniz günü eksi yazar.</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}