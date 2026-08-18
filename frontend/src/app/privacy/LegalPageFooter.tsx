import Link from "next/link";

export const LegalPageFooter = () => (
  <div className="bg-gray-900 text-white py-8 mt-12">
    <div className="container mx-auto max-w-4xl px-4 text-center">
      <p className="text-gray-400 text-sm mb-2">© 2026 SKREENA LIMITED. All rights reserved.</p>
      <p className="text-gray-500 text-xs">
        <Link href="/" className="hover:text-indigo-400 transition-colors mx-1">Home</Link> ·
        <Link href="/terms" className="hover:text-indigo-400 transition-colors mx-1">Terms of Service</Link> ·
        <Link href="/privacy" className="hover:text-indigo-400 transition-colors mx-1">Privacy Policy</Link>
      </p>
    </div>
  </div>
);
