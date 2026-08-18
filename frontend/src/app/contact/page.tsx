import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Contact | AIRecruitX",
  description: "Get in touch with the AIRecruitX team",
};

export default function ContactPage() {
  return (
    <main>
      <Contact />
      <Footer />
    </main>
  );
}
