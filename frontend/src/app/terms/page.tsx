import { TermsContent } from "./TermsContent";
import { LegalPageFooter } from "./LegalPageFooter";

export const metadata = {
  title: "Terms of Service | Skreena",
  description: "Skreena's Terms of Service - Legal terms governing your use of our AI-powered recruiting platform",
};

export default function TermsOfService() {
  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: 24 January 2026</p>
        <TermsContent />
      </div>

      <LegalPageFooter />
    </>
  );
}
