import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Contact | AiRecruitex",
  description: "Get in touch with the AiRecruitex team",
};

export default function ContactPage() {
  return (
    <main>
      <Contact />
      <Footer />
    </main>
  );
}
