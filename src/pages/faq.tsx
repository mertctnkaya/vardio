import { useState, useMemo } from 'react';

// S.S.S Bilgi Bankası Verileri
const FAQ_DATA = [
    {
        category: "Maaş, Vergi ve Mesailer",
        faqs: [
            { q: "Vergi dilimi nedir? Yıl sonuna doğru maaşım neden düşer?", a: "Kümülatif Gelir Vergisi matrahınız arttıkça yıl içinde %15 ile başlayan vergi diliminiz %20 ve %27'ye çıkar. Bu nedenle brüt maaşınız sabit kalsa bile (özellikle ikramiye alınan aylardan sonra) vergi kesintiniz artacağı için elinize geçen net maaş azalır." },
            { q: "Fazla çalışma ücretine hangi hallerde hak kazanılmaktadır?", a: "Haftalık yasal çalışma süresi olan 45 saati aşan her çalışma 'Fazla Mesai' sayılır ve saatlik ücretiniz %50 zamlı (1.5 katı) olarak ödenmek zorundadır." },
            { q: "Hafta tatili (Pazar) mesaisi nasıl hesaplanır?", a: "Hafta tatilinde çalışılması yasaktır ancak çalışılırsa, o günün yevmiyesine ek olarak %50 zamlı (1.5 yevmiye) ödenmesi gerektiği Yargıtay kararlarıyla sabittir. Toplamda o gün için 2.5 yevmiye ödenmelidir." },
            { q: "Tatil günlerinde çalışan bir işçinin ücreti nasıl hesaplanır?", a: "Ulusal bayram ve resmi tatillerde (Örn: 23 Nisan, Bayramlar) çalışırsanız, o günün yevmiyesine ek olarak +1 yevmiye daha alırsınız. Yani toplamda o gün için çift yevmiye ödenir." },
            { q: "Maaşımın bir kısmı bankadan, bir kısmı elden veriliyor. Yasal mı?", a: "KESİNLİKLE HAYIR. Bu durum SGK primlerinizin ve ileride alacağınız emekli maaşının/tazminatın düşük yatması anlamına gelir. İşçi bu durumu ispatlarsa, sözleşmeyi haklı nedenle feshedip kıdem tazminatını alarak derhal işten ayrılabilir." },
            { q: "Ücretler hangi aralıklarla ve hangi oranlarda artırılmalıdır?", a: "İş Kanununda 'Her yıl zam yapılır' diye zorunlu bir oran yoktur (Asgari ücretin altında kalmamak şartıyla). Ancak iş veya toplu iş sözleşmenizde 'Enflasyon oranında artırılır' maddesi varsa işveren buna kesinlikle uymak zorundadır." },
            { q: "Çalışanlara yol ve yemek parası verilmesi gerekli midir?", a: "Hayır. Yasada işverenin yol/yemek parası verme zorunluluğu yoktur. Ancak sözleşmede belirtilmişse veya fabrikada bu imkanlar uzun süredir sağlanıyorsa bu 'Kazanılmış Hak' (İşyeri Uygulaması) olur ve sonradan tek taraflı kesilemez." },
            { q: "İşçilere ücret kesme cezası verilmesinin koşulları nelerdir?", a: "İşveren kafasına göre maaşınızdan ceza kesemez. Ücret kesme cezasının sebepleri toplu iş sözleşmesinde veya iç yönetmelikte açıkça belirtilmeli ve kesilen para 1 ay içinde Çalışma Bakanlığı hesabına yatırılmalıdır. (Bir ayda 2 yevmiyeden fazla ceza kesilemez)." },
        ]
    },
    {
        category: "İstifa, Çıkış ve Tazminat",
        faqs: [
            { q: "Kıdem tazminatının ödenmesi için gereken koşullar nelerdir?", a: "Aynı işyerinde en az 1 tam yıl çalışmış olmanız gerekir. Haksız yere çıkarılmanız, askerlik, emeklilik, sağlık sebepleri veya kadınlar için evlilik nedeniyle ayrılma durumlarında kıdem tazminatı ödenir." },
            { q: "15 Yıl 3600 Gün şartıyla kıdem tazminatı nasıl alınır?", a: "08.09.1999 tarihinden önce sigorta girişi olanlar 15 yıl 3600 gün; bu tarihten sonra girenler ise 25 yıl 4500 gün şartını sağladıklarında SGK'dan alacakları 'Kıdem tazminatı alabilir' yazısı ile kendi istekleriyle işten ayrılarak (istifa ederek) tazminatlarını tam alabilirler." },
            { q: "İşten kendi isteğiyle ayrılan işçi ihbar tazminatı alabilir mi?", a: "Kendi isteğiyle (istifa) ayrılan işçi İhbar Tazminatı ALAMAZ. İhbar süresine uymadan (örneğin 4 haftalık bildirim süresini beklemeden) aniden işi bırakırsa, işverene kendisi ihbar tazminatı ödemek zorunda kalabilir." },
            { q: "İşyerinde Mobbing (Psikolojik Baskı) görüyorum, ne yapmalıyım?", a: "İşveren veya yöneticiler tarafından sistematik olarak dışlanma, hakaret veya psikolojik baskıya (mobbing) maruz kalıyorsanız, bu durumu ispatlayarak (yazışmalar, şahitler) sözleşmenizi haklı nedenle feshedebilir ve kıdem tazminatınızı alabilirsiniz." },
            { q: "İhbar sürem (çıkış bekleme süresi) içindeyken yeni iş arayabilir miyim?", a: "Evet. İhbar süreniz boyunca işveren size günde en az 2 saat 'Yeni İş Arama İzni' vermek zorundadır. İsterseniz bu saatleri toplu olarak birleştirip, işten daha erken ayrılmak için peşin kullanabilirsiniz." },
            { q: "Evlilik nedeniyle istifa eden kadın işçi kıdem tazminatı alabilir mi?", a: "Evet. Kadın işçi, resmi nikah tarihinden itibaren 1 yıl içinde iş sözleşmesini evlilik gerekçesiyle feshederse kıdem tazminatını alarak işten ayrılabilir." },
            { q: "İşyerinin taşınması veya şartların ağırlaşması tazminat hakkı verir mi?", a: "Evet. İşveren çalışma şartlarınızda 'esaslı bir değişiklik' yaparsa (Örn: Fabrikayı uzak bir ilçeye taşıması, maaşınızı/yan haklarınızı düşürmesi, sabit vardiyanızı rotasyona çevirmesi) bunu size yazılı bildirmelidir. Kabul etmezseniz tazminatınızı alarak çıkabilirsiniz." },
            { q: "Tazminat ve işçilik alacaklarında zaman aşımı ne kadardır?", a: "Kıdem tazminatı, ihbar tazminatı, yıllık izin ücreti ve ödenmeyen fazla mesai gibi tüm işçilik alacaklarında zaman aşımı süresi işten çıkış tarihinden itibaren 5 yıldır." }
        ]
    },
    {
        category: "İzin, Rapor ve Sağlık",
        faqs: [
            { q: "Kullanmadığım yıllık izinlerin parasını çalışırken alabilir miyim?", a: "Hayır. Yıllık izin anayasal bir dinlenme hakkıdır ve çalışırken işçiye 'İzin yapma, parasını verelim' denilemez. Ancak işten ayrıldığınızda (istifa etseniz dahi) içeride kalan tüm izinlerinizin parası son brüt maaşınız üzerinden size ödenmek zorundadır." },
            { q: "Yıllık iznimin içine resmi tatil veya pazar günü denk gelirse ne olur?", a: "Yıllık izin günleri hesaplanırken, izne denk gelen Ulusal Bayram, Genel Tatil ve Hafta Tatili (Pazar) günleri izin süresinden SAYILMAZ. İzniniz bu tatil günleri kadar uzatılmak zorundadır." },
            { q: "Yıllık iznimi bölerek kullanabilir miyim?", a: "Evet. Yıllık izin tarafların anlaşması ile bir bölümü 10 günden aşağı olmamak üzere istenildiği kadar bölünebilir." },
            { q: "Çalışanın raporlu olduğu günlerde işveren ücret öder mi?", a: "Hayır, işveren raporlu günlerin parasını ödemek zorunda değildir (Maktu aylıklı sözleşmeler hariç). 3 gün ve üzeri raporlarda paranızı PTT veya Banka üzerinden SGK'dan alırsınız. İlk 2 günün parasını kimse ödemez." },
            { q: "Kadın işçilerin süt izni ne kadardır?", a: "Kadın işçilere 1 yaşından küçük çocuklarını emzirmeleri için günde toplam 1.5 saat süt izni verilir. Bu sürenin hangi saatlerde kullanılacağını işçi kendi belirler ve bu süre çalışılmış sayılır." },
            { q: "Eşi doğum yapan işçiye kaç gün izin verilir?", a: "Eşi doğum yapan erkek işçiye 5 gün ücretli babalık izni verilir." },
            { q: "Birinci derece akraba vefatında kaç gün izin hakkı vardır?", a: "İşçinin annesi, babası, eşi, kardeşi veya çocuğunun vefatı halinde işçiye 3 gün ücretli mazeret izni verilir." }
        ]
    },
    {
        category: "SGK ve Emeklilik Hakları",
        faqs: [
            { q: "Ne zaman emekli olacağımı nasıl öğrenebilirim?", a: "E-Devlet sistemine giriş yaparak 'Çalışma Hayatım' veya 'Ne Zaman Emekli Olurum' uygulaması üzerinden toplam prim gün sayınızı, sigortalılık sürenizi ve kalan yaş şartınızı anlık olarak takip edebilirsiniz." },
            { q: "EYT (Emeklilikte Yaşa Takılanlar) kimleri kapsar?", a: "08.09.1999 ve öncesinde ilk kez sigortalı olarak çalışmaya başlayanlar, kanundaki prim günü ve sigortalılık süresi şartlarını doldurduklarında herhangi bir yaş şartı aranmaksızın EYT kapsamında emekli olabilmektedir." },
            { q: "İşsizlik sigortasından yararlanma şartları nelerdir?", a: "1) Kendi isteğinizle ayrılmamış olmak. 2) İşten çıkmadan önceki son 120 gün hizmet akdine tabi çalışmak. 3) Son 3 yıl içinde en az 600 gün işsizlik primi ödenmiş olmak." },
            { q: "İşsizlik ödeneği ne kadar süre ile ödenmektedir?", a: "Son 3 yılda; 600 gün primi olanlara 6 ay, 900 gün primi olanlara 8 ay, 1080 gün primi olanlara 10 ay boyunca işsizlik maaşı ödenir." },
            { q: "İşsizlik ödeneği alırken sağlık hizmetlerinden yararlanabilir miyim?", a: "Evet. İşsizlik ödeneği aldığınız aylar boyunca Genel Sağlık Sigortası (GSS) priminiz İŞKUR tarafından ödenir. Ailenizle birlikte devlet hastanelerinden ücretsiz faydalanabilirsiniz." },
            { q: "İşverenin iflas etmesi durumunda içeride kalan maaşım ne olur?", a: "İşverenin iflası veya konkordato ilan etmesi durumunda, işçilerin içeride kalan son 3 aylık net maaşları İŞKUR bünyesindeki 'Ücret Garanti Fonu' tarafından ödenir." }
        ]
    },
    {
        category: "Sendikalar ve Toplu İş Sözleşmesi (TİS)",
        faqs: [
            { q: "Toplu İş Sözleşmesi (TİS) nedir?", a: "Sendika ile işveren (veya MESS gibi işveren sendikaları) arasında yapılan; işçilerin maaş zam oranlarını, ikramiyelerini (örn: yılda 4 maaş ikramiye), erzak, yakacak ve tatil yardımlarını yasal asgari sınırların çok daha üzerine çıkaran bağlayıcı, güçlü bir sözleşmedir." },
            { q: "Sendikalı olmam işten atılmama sebep olur mu?", a: "Sendikaya üye olmak anayasal bir haktır. İşveren sırf sendikaya üye olduğunuz (veya üye olmaya çalıştığınız) için sizi işten çıkarırsa, normal tazminatlara ek olarak en az 1 yıllık brüt maaşınız tutarında 'Sendikal Tazminat' ödemek zorunda kalır." },
            { q: "Grev hakkı nedir ve ne zaman kullanılır?", a: "Toplu iş sözleşmesi görüşmelerinde anlaşma sağlanamazsa sendika 'Grev' kararı alabilir. Grev süresince iş sözleşmeniz askıda kalır (maaş işlemez) ancak işveren bu sürede sizi işten çıkaramaz ve kesinlikle yerinize yeni işçi alamaz." },
            { q: "İşyeri sendika temsilcisi kimdir, güvencesi var mıdır?", a: "Fabrikadaki işçiler ile yönetim/sendika arasındaki iletişimi sağlayan seçilmiş işçilerdir. Temsilcilerin çok güçlü yasal güvenceleri vardır; işveren haklı ve çok geçerli bir sebep olmadan (sırf sendikal faaliyetleri yüzünden) temsilciyi işten çıkaramaz, görev yerini değiştiremez." },
            { q: "Sendika üyelik aidatı nasıl belirlenir ve kim öder?", a: "Aidat tutarı sendikanın tüzüğünde yazar (Genellikle aylık 1 günlük brüt yevmiyeniz kadardır). Üye olduktan sonra işveren bu tutarı her ay maaşınızdan keserek sendika hesabına yasal olarak aktarır." },
            { q: "E-Devlet üzerinden sendikadan istifa edersem ne olur?", a: "İstifa ettiğiniz an sendikanın sağladığı TİS haklarından (İkramiyeler, zam oranları vs.) yararlanmanız sona erer. Ancak 'Dayanışma Aidatı' ödeyerek sendikaya üye olmadan da bu haklardan faydalanmaya devam edebilirsiniz." },
            { q: "İşçi sendikasına nasıl üye olunur?", a: "Günümüzde sendika üyelikleri e-Devlet kapısı üzerinden 'İşçi Sendikaları Üyelik İşlemleri' menüsünden noter şartı aranmaksızın saniyeler içinde tamamen dijital olarak yapılmaktadır." }
        ]
    }
];

// Renk Temaları (Sırasıyla kategorilere atanacak)
const THEMES = [
    { text: 'text-emerald-400', iconBg: 'bg-emerald-500/10', borderHover: 'hover:border-emerald-500/30' },
    { text: 'text-rose-400', iconBg: 'bg-rose-500/10', borderHover: 'hover:border-rose-500/30' },
    { text: 'text-sky-400', iconBg: 'bg-sky-500/10', borderHover: 'hover:border-sky-500/30' },
    { text: 'text-amber-400', iconBg: 'bg-amber-500/10', borderHover: 'hover:border-amber-500/30' },
    { text: 'text-purple-400', iconBg: 'bg-purple-500/10', borderHover: 'hover:border-purple-500/30' }
];

export default function FAQ() {
    const [activeTab, setActiveTab] = useState<'usage' | 'rights' | 'faq'>('usage');
    const [searchQuery, setSearchQuery] = useState('');

    // Arama Motoru Algoritması (Sadece FAQ sekmesi için)
    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return FAQ_DATA;
        const lowerQ = searchQuery.toLowerCase();
        
        return FAQ_DATA.map(category => {
            const filteredQuestions = category.faqs.filter(
                faq => faq.q.toLowerCase().includes(lowerQ) || faq.a.toLowerCase().includes(lowerQ)
            );
            return { ...category, faqs: filteredQuestions };
        }).filter(cat => cat.faqs.length > 0);
    }, [searchQuery]);

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
                                    <p className="text-sm text-base-content/70 mt-1">Bordro hesaplamaları yasal olarak Brüt maaş üzerinden yapılır. Eğer sadece "Aylık Net" veya "Saatlik Ücretinizi" biliyorsanız; <strong>Hesaplamalar</strong> menüsünden <strong>Saatlikten Bul</strong> veya <strong>Araçlar (Aylıktan)</strong> sekmelerine giderek elinizdeki tutarı yazın. Sistem Brüt maaşınızı otomatik bulup kaydedecektir.</p>                               </div>
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
                                <p><strong>Bordro Motoru Kümülatif Çalışır:</strong> Basit maaş hesaplama sitelerinin aksine, bu sistem her ayı yaşanmış günleri baz alarak (geleceğin parasını yatırmadan) hesaplar. SGK İşçi (%14), İşsizlik (%1) kesintilerinden sonra, yasal Vergi Matrahınızı bulur. Asgari ücret Damga ve Gelir Vergisi istisnalarını düşarak net maaşınıza ulaşır.</p>
                                <p><strong>Yıllık İzin Geçmiş Eşitlemesi:</strong> Siz sisteme "Benim 14 gün iznim kaldı" dediğinizde, sistem işe giriş tarihinize bakıp "Bu kişi yasal olarak 56 gün izin hak etmiş olmalı, demek ki geçmişte 42 gününü kullanmış" diyerek arka planda eksik günlerinizi veritabanına otomatik eşitler.</p>
                                <p><strong>Verileriniz Nasıl Korunuyor?</strong> Bilgileriniz basit bir tarayıcı hafızasında (LocalStorage) tutulmaz. Google'ın bulut standartlarında olan Supabase sunucularında, e-posta adresinize bağlanan 64 karakterlik kriptolu kimliklerle (UUID) şifrelenir. Sistemde aktif Row Level Security (Satır Güvenliği) bulunduğu sürece yönetici dahi şifrenizi öğrenemez.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* === İŞÇİ HAKLARI (YASAL) === */}
                {activeTab === 'rights' && (
                    <div className="space-y-6 animate-fade-in">
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

                {/* === YENİ ARAMA MOTORLU S.S.S. === */}
                {activeTab === 'faq' && (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* Arama Barı ve Başlık */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-base-300 pb-6">
                            <div>
                                <h3 className="text-xl font-bold text-indigo-400">Sıkça Sorulan Sorular</h3>
                                <p className="text-sm text-base-content/60 mt-1">İş Kanunu, SGK ve İŞKUR hakkında merak ettiklerinizi arayın.</p>
                            </div>
                            <div className="w-full sm:w-80 relative group">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400 group-focus-within:text-indigo-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input 
                                    type="text" 
                                    className="input input-bordered w-full bg-base-200/80 pl-10 focus:ring-2 focus:ring-indigo-500 border-indigo-500/30" 
                                    placeholder="Örn: Kıdem, Rapor, Mesai..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Akordeon Listesi */}
                        {filteredFaqs.length === 0 ? (
                            <div className="text-center py-12 bg-base-200 rounded-xl border border-base-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-base-content/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-base-content/60">Aradığınız kelimeye ait bir soru bulunamadı.</p>
                            </div>
                        ) : (
                            filteredFaqs.map((category, catIndex) => {
                                // Her kategoriye sırayla bir tema rengi ata
                                const theme = THEMES[catIndex % THEMES.length];
                                
                                return (
                                    <div key={catIndex} className="mb-8">
                                        <h4 className={`font-bold uppercase tracking-wider text-xs mb-3 ml-2 flex items-center gap-2 ${theme.text}`}>
                                            <span className={`w-2 h-2 rounded-full ${theme.iconBg.replace('/10', '')}`}></span>
                                            {category.category}
                                        </h4>
                                        <div className="space-y-2">
                                            {category.faqs.map((faq, faqIndex) => (
                                                <div key={faqIndex} className={`collapse collapse-arrow bg-base-200 border border-base-300 shadow-sm transition-all duration-300 ${theme.borderHover}`}>
                                                    <input type="checkbox" className="peer" /> 
                                                    <div className="collapse-title text-base sm:text-md font-bold text-base-content/90 flex items-center gap-3 pr-10 peer-checked:text-base-content">
                                                        <span className={`${theme.text} ${theme.iconBg} p-1.5 rounded-lg shrink-0`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                                        </span>
                                                        {faq.q}
                                                    </div>
                                                    <div className="collapse-content text-sm text-base-content/70 leading-relaxed bg-[#1e2329] pt-4 border-t border-base-300">
                                                        <p>{faq.a}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}