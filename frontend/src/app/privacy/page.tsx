import { PrivacyContent } from "./PrivacyContent";
import { LegalPageFooter } from "./LegalPageFooter";

export const metadata = {
  title: "Privacy Policy | Skreena",
  description: "Skreena's Privacy Policy - How we collect, use, and protect your personal data",
};

export default function PrivacyPolicy() {
  return (
    <>
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto max-w-3xl px-4" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: 11 February 2026</p>
        <PrivacyContent />
      </div>

      <LegalPageFooter />
    </>
  );
}
