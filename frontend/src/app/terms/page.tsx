import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Skreena",
  description: "Skreena's Terms of Service - Legal terms governing your use of our AI-powered recruiting platform",
};

export default function TermsOfService() {
  return (
    <>
      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: 24 January 2026</p>

        {/* Summary Box */}
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-700">
            These terms govern your use of Skreena's AI-powered recruiting platform. By using our service, you agree to these terms. 
            Key points: Skreena is a screening tool (you make hiring decisions), you're responsible for how you use candidate data, 
            and we operate on a pay-as-you-go credit system.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
        <p className="text-gray-700 mb-4">
          These Terms of Service ("Terms") constitute a legally binding agreement between you and{" "}
          <strong>SKREENA LIMITED</strong> (Company Number: 16983568), a company registered in England and Wales with its 
          registered address at 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom ("Skreena", "we", "our", "us").
        </p>
        <p className="text-gray-700 mb-4">
          By accessing or using our AI-powered recruiting platform at skreena.com (the "Service"), you agree to be bound by these Terms. 
          If you do not agree to these Terms, do not use the Service.
        </p>
        <p className="text-gray-700 mb-6">
          If you are using the Service on behalf of an organisation, you represent that you have authority to bind that organisation 
          to these Terms.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
        <p className="text-gray-700 mb-4">Skreena provides an AI-powered candidate screening and interview platform that enables recruiters to:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Create job listings with AI-generated interview questions</li>
          <li>Share application links with candidates</li>
          <li>Conduct automated AI interviews with candidates</li>
          <li>Receive AI-generated match scores and candidate insights</li>
          <li>Review and manage candidate applications</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-8">
          <strong className="text-gray-900">Important:</strong> Skreena is a screening and prioritisation tool. 
          All hiring decisions must be made by human recruiters. Skreena does not make employment decisions and should not be used 
          as the sole basis for hiring or rejecting candidates.
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Account Registration</h2>
        <p className="text-gray-700 mb-4">To use the Service, you must:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Register for an account with accurate and complete information</li>
          <li>Be at least 18 years old</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorised access to your account</li>
        </ul>
        <p className="text-gray-700 mb-6">
          You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate 
          accounts that violate these Terms.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Credits and Payment</h2>
        <p className="text-gray-700 mb-4">Skreena operates on a pay-as-you-go credit system:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Credits are purchased in advance and used to access AI features</li>
          <li>Credit costs vary by operation (job analysis, interviews, scoring, etc.)</li>
          <li>Credits are non-refundable except where required by law</li>
          <li>Unused credits do not expire while your account remains active</li>
          <li>We reserve the right to modify credit pricing with 30 days notice</li>
        </ul>
        <p className="text-gray-700 mb-6">
          All prices are in GBP (British Pounds) unless otherwise stated. Payment is processed securely via Stripe. 
          We do not store your payment card details.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Acceptable Use</h2>
        <p className="text-gray-700 mb-4">You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Use the Service for any discriminatory hiring practices</li>
          <li>Upload false, misleading, or fraudulent job listings</li>
          <li>Attempt to circumvent security measures or access restrictions</li>
          <li>Use the Service to collect data for purposes other than legitimate recruitment</li>
          <li>Share account credentials or allow unauthorised access</li>
          <li>Use automated scripts or bots to access the Service (except via our API if provided)</li>
          <li>Reverse engineer, decompile, or attempt to extract source code</li>
          <li>Use the Service in any way that could damage or overburden our systems</li>
          <li>Violate any applicable laws, regulations, or third-party rights</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Responsibilities as a Recruiter</h2>
        <p className="text-gray-700 mb-4">As a user of Skreena, you are responsible for:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li><strong>Compliance with employment laws:</strong> Ensuring your use of the Service complies with all applicable employment, anti-discrimination, and data protection laws</li>
          <li><strong>Candidate data:</strong> How you collect, use, and store candidate personal data processed through the Service</li>
          <li><strong>Hiring decisions:</strong> All employment decisions made based on information provided by the Service</li>
          <li><strong>Job listing accuracy:</strong> Ensuring job descriptions and requirements are accurate and lawful</li>
          <li><strong>Candidate communications:</strong> Any communications you have with candidates outside of the automated interview process</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Skreena provides AI-generated scores and insights as a tool to assist your decision-making. These are not recommendations 
          to hire or reject any candidate. You must independently evaluate candidates and make your own hiring decisions.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. AI-Generated Content</h2>
        <p className="text-gray-700 mb-4">The Service uses artificial intelligence to generate interview questions, analyse CVs, conduct interviews, and produce match scores and insights.</p>
        <p className="text-gray-700 mb-4">You acknowledge that:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>AI-generated content may contain errors or inaccuracies</li>
          <li>AI scores are indicative, not definitive assessments of candidate suitability</li>
          <li>You should verify important information independently</li>
          <li>AI technology has limitations and should complement, not replace, human judgment</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Intellectual Property</h2>
        <p className="text-gray-700 mb-4">
          <strong>Our Property:</strong> The Service, including all software, design, text, graphics, and other content created by Skreena, 
          is owned by us and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works 
          without our written permission.
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Your Content:</strong> You retain ownership of content you submit to the Service (job descriptions, company information, etc.). 
          You grant us a licence to use this content to provide the Service.
        </p>
        <p className="text-gray-700 mb-6">
          <strong>Candidate Content:</strong> Candidate CVs and interview responses are processed on behalf of you (the recruiter). 
          Ownership and rights in candidate data are governed by your relationship with candidates and applicable data protection laws.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Disclaimer of Warranties</h2>
        <p className="text-gray-700 mb-4">The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Warranties of merchantability or fitness for a particular purpose</li>
          <li>Warranties that the Service will be uninterrupted, error-free, or secure</li>
          <li>Warranties regarding the accuracy or reliability of AI-generated content</li>
        </ul>
        <p className="text-gray-700 mb-6">We do not warrant that the Service will meet your specific requirements or that any particular candidate will be suitable for employment.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">To the maximum extent permitted by law:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Skreena shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
          <li>Skreena shall not be liable for any loss of profits, data, business opportunities, or goodwill</li>
          <li>Skreena's total liability shall not exceed the amount you paid to us in the 12 months preceding the claim</li>
        </ul>
        <p className="text-gray-700 mb-4">This limitation applies regardless of the legal theory on which the claim is based.</p>
        <p className="text-gray-700 mb-6">Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Indemnification</h2>
        <p className="text-gray-700 mb-4">You agree to indemnify and hold harmless Skreena, its directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Any hiring decisions you make based on information from the Service</li>
          <li>Any claims by candidates relating to their applications processed through the Service</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Privacy and Data Protection</h2>
        <p className="text-gray-700 mb-4">
          Our collection and use of personal data is governed by our{" "}
          <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
        </p>
        <p className="text-gray-700 mb-6">
          When processing candidate personal data on your behalf, we act as a Data Processor under UK GDPR. You remain the Data Controller 
          and are responsible for ensuring you have the appropriate legal basis to process candidate data.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Term and Termination</h2>
        <p className="text-gray-700 mb-4">
          <strong>Term:</strong> These Terms remain in effect while you use the Service.
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Termination by You:</strong> You may stop using the Service and close your account at any time by contacting us at hello@skreena.com.
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Termination by Us:</strong> We may suspend or terminate your access to the Service immediately if you violate these Terms, 
          or with 30 days notice for any other reason.
        </p>
        <p className="text-gray-700 mb-6">
          <strong>Effect of Termination:</strong> Upon termination, your right to use the Service ceases. We may delete your account data 
          in accordance with our Privacy Policy. Any unused credits are forfeited upon termination, except where termination is by us 
          without cause, in which case we may offer a pro-rata refund at our discretion.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Modifications to Terms</h2>
        <p className="text-gray-700 mb-4">
          We may modify these Terms at any time. We will notify registered users of material changes by email at least 30 days before 
          the changes take effect.
        </p>
        <p className="text-gray-700 mb-6">
          Your continued use of the Service after changes take effect constitutes acceptance of the modified Terms. If you do not agree 
          to the modified Terms, you must stop using the Service.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">15. General Provisions</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li><strong>Governing Law:</strong> These Terms are governed by the laws of England and Wales.</li>
          <li><strong>Jurisdiction:</strong> Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</li>
          <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Skreena regarding the Service.</li>
          <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in effect.</li>
          <li><strong>No Waiver:</strong> Our failure to enforce any right or provision shall not constitute a waiver of that right or provision.</li>
          <li><strong>Assignment:</strong> You may not assign or transfer your rights under these Terms. We may assign our rights to any affiliate or successor.</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">16. Contact Us</h2>
        <p className="text-gray-700 mb-4">For questions about these Terms, please contact us:</p>
        <p className="text-gray-700 mb-6">
          <strong>SKREENA LIMITED</strong><br />
          71-75 Shelton Street, Covent Garden<br />
          London, WC2H 9JQ<br />
          United Kingdom<br /><br />
          Email: <a href="mailto:hello@skreena.com" className="text-indigo-600 hover:underline">hello@skreena.com</a>
        </p>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="text-gray-400 text-sm mb-2">© 2026 SKREENA LIMITED. All rights reserved.</p>
          <p className="text-gray-500 text-xs">
            <Link href="/" className="hover:text-indigo-400 transition-colors mx-1">Home</Link> · 
            <Link href="/terms" className="hover:text-indigo-400 transition-colors mx-1">Terms of Service</Link> · 
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors mx-1">Privacy Policy</Link> · 
            <Link href="/ai-policy" className="hover:text-indigo-400 transition-colors mx-1">AI Policy</Link>
          </p>
        </div>
      </div>
    </>
  );
}