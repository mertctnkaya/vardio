import ContactHero from '../components/contact/ContactHeader';
import ContactForm from '../components/contact/ContactForm';
import ContactSidebar from '../components/contact/ContactSidebar';

export default function Contact() {
  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10">
      
      {/* ÜST BAŞLIK VE BİLGİLENDİRME */}
      <ContactHero />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        {/* İLETİŞİM FORMU (SOL TARAF - GENİŞ) */}
        <ContactForm />

        {/* DİĞER İLETİŞİM YOLLARI (SAĞ TARAF - DAR) */}
        <ContactSidebar />
      </div>

    </div>
  );
}