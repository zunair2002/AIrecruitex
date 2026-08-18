export const PrivacySectionsPart1 = () => (
  <>
{/* Summary Box */}
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-700">
            Skreena is an AI-powered recruiting platform. We process candidate data on behalf of recruiters (as a processor) 
            and manage recruiter accounts directly (as a controller). We use AI to conduct interviews and score candidates. 
            We do not sell your data. Candidates can delete all their data at any time via the{" "}
            <a href="/portal" className="text-indigo-600 hover:underline">Candidate Portal</a>.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Who We Are</h2>
        <p className="text-gray-700 mb-4">
          <strong>SKREENA LIMITED</strong> ("Skreena", "we", "our", "us") is a company registered in England and Wales.
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li><strong>Company Number:</strong> 16983568</li>
          <li><strong>Registered Address:</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom</li>
          <li><strong>Contact:</strong> <a href="mailto:hello@skreena.com" className="text-indigo-600 hover:underline">hello@skreena.com</a></li>
        </ul>
        <p className="text-gray-700 mb-6">
          This Privacy Policy explains how we collect, use, and protect personal data when you use our AI-powered recruiting 
          platform at skreena.com (the "Service").
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Our Role: Controller vs Processor</h2>
        <p className="text-gray-700 mb-4">Under UK GDPR, we act in different capacities depending on whose data we process:</p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">When we are the Data Controller:</h3>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Recruiter account data (company name, email, password, settings)</li>
          <li>Payment and billing information</li>
          <li>Communications with us</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">When we are the Data Processor:</h3>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Candidate data submitted through our platform (CVs, interview responses, contact details)</li>
          <li>In this case, the recruiter (our customer) is the Data Controller</li>
        </ul>
        <p className="text-gray-700 mb-6">
          If you are a candidate who has applied for a role through Skreena and wish to exercise your data protection rights, 
          please contact the recruiter/employer you applied to directly. If you need assistance identifying them, contact us at{" "}
          <a href="mailto:hello@skreena.com" className="text-indigo-600 hover:underline">hello@skreena.com</a>.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information We Collect</h2>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">From Recruiters:</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Data Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Examples</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-700">Account Information</td>
                <td className="px-4 py-3 text-sm text-gray-700">Company name, email address, password</td>
                <td className="px-4 py-3 text-sm text-gray-700">Account creation and authentication</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-700">Job Data</td>
                <td className="px-4 py-3 text-sm text-gray-700">Job descriptions, requirements, interview questions</td>
                <td className="px-4 py-3 text-sm text-gray-700">Providing the Service</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-700">Settings</td>
                <td className="px-4 py-3 text-sm text-gray-700">Language preferences, AI assistant name, branding</td>
                <td className="px-4 py-3 text-sm text-gray-700">Customising the Service</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-700">Usage Data</td>
                <td className="px-4 py-3 text-sm text-gray-700">Login times, features used, credit usage</td>
                <td className="px-4 py-3 text-sm text-gray-700">Service improvement and billing</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">Payment Data</td>
                <td className="px-4 py-3 text-sm text-gray-700">Processed securely via Stripe (we do not store card details)</td>
                <td className="px-4 py-3 text-sm text-gray-700">Processing payments</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">From Candidates (on behalf of Recruiters):</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Data Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Examples</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-700">Contact Information</td>
                <td className="px-4 py-3 text-sm text-gray-700">Name, email address, phone number</td>
                <td className="px-4 py-3 text-sm text-gray-700">Application processing</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-700">CV/Resume Data</td>
                <td className="px-4 py-3 text-sm text-gray-700">Work history, skills, education, qualifications</td>
                <td className="px-4 py-3 text-sm text-gray-700">AI analysis and matching</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-700">Interview Responses</td>
                <td className="px-4 py-3 text-sm text-gray-700">Answers to interview questions, conversation transcripts</td>
                <td className="px-4 py-3 text-sm text-gray-700">AI scoring and recruiter review</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">Technical Data</td>
                <td className="px-4 py-3 text-sm text-gray-700">Browser type, session information, IP address</td>
                <td className="px-4 py-3 text-sm text-gray-700">Security and fraud prevention</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>To provide and maintain the Service</li>
          <li>To conduct AI-powered candidate interviews</li>
          <li>To analyse CVs and generate match scores</li>
          <li>To create candidate insights and summaries for recruiters</li>
          <li>To send transactional emails (interview invitations, notifications, password resets)</li>
          <li>To process payments and manage accounts</li>
          <li>To improve and develop our Service</li>
          <li>To detect and prevent fraud and abuse</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. AI Processing</h2>
        <p className="text-gray-700 mb-4">Skreena uses artificial intelligence (powered by Anthropic's Claude) to:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Conduct automated candidate interviews via chat</li>
          <li>Parse and analyse CV content</li>
          <li>Score candidates against job requirements</li>
          <li>Generate summaries and insights for recruiters</li>
          <li>Detect potential discrepancies between CV claims and interview responses</li>
        </ul>
        <p className="text-gray-700 mb-4">
          <strong>Important:</strong> AI-generated scores and insights are provided to assist recruiters in their decision-making. 
          All final hiring decisions are made by human recruiters, not by our AI systems. Skreena is a screening tool that helps 
          prioritise candidates; it does not make employment decisions.
        </p>
        <p className="text-gray-700 mb-6">
          We have tested our AI systems to ensure consistent scoring regardless of candidate name, gender, ethnicity, or age. 
          The system evaluates qualifications and responses only.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Legal Basis for Processing</h2>
        <p className="text-gray-700 mb-4">Under UK GDPR, we process personal data on the following legal bases:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li><strong>Contract:</strong> To provide the Service to recruiters who have signed up</li>
          <li><strong>Legitimate Interests:</strong> To improve our Service, ensure security, and prevent fraud</li>
          <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
          <li><strong>Consent:</strong> Where specifically requested (e.g., marketing communications)</li>
        </ul>
        <p className="text-gray-700 mb-6">
          For candidate data, recruiters are the Data Controllers and are responsible for ensuring they have the appropriate 
          legal basis to collect and process candidate applications.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Data Sharing and Sub-processors</h2>
        <p className="text-gray-700 mb-4">We share personal data with the following categories of service providers who help us deliver the Service:</p>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Provider</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Location</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="px-4 py-3 text-sm text-gray-700">Anthropic (Claude AI)</td><td className="px-4 py-3 text-sm text-gray-700">AI interview processing, CV analysis, scoring</td><td className="px-4 py-3 text-sm text-gray-700">United States</td></tr>
              <tr className="border-b"><td className="px-4 py-3 text-sm text-gray-700">SendGrid (Twilio)</td><td className="px-4 py-3 text-sm text-gray-700">Transactional email delivery</td><td className="px-4 py-3 text-sm text-gray-700">United States</td></tr>
              <tr className="border-b"><td className="px-4 py-3 text-sm text-gray-700">Cloudflare</td><td className="px-4 py-3 text-sm text-gray-700">Security, DNS, email routing</td><td className="px-4 py-3 text-sm text-gray-700">Global</td></tr>
              <tr className="border-b"><td className="px-4 py-3 text-sm text-gray-700">IONOS</td><td className="px-4 py-3 text-sm text-gray-700">Server hosting and data storage</td><td className="px-4 py-3 text-sm text-gray-700">European Union</td></tr>
              <tr><td className="px-4 py-3 text-sm text-gray-700">Stripe</td><td className="px-4 py-3 text-sm text-gray-700">Payment processing</td><td className="px-4 py-3 text-sm text-gray-700">United States</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-700 mb-4"><strong>We do not sell your personal data to third parties.</strong></p>
        <p className="text-gray-700 mb-6">We may also disclose personal data where required by law, to protect our legal rights, or in connection with a business transfer (e.g., merger or acquisition).</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. International Data Transfers</h2>
        <p className="text-gray-700 mb-4">Some of our sub-processors are located outside the United Kingdom. When we transfer personal data internationally, we ensure appropriate safeguards are in place:</p>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
          <li>Transfers to countries with an adequacy decision from the UK</li>
          <li>Standard Contractual Clauses (SCCs) approved by the ICO</li>
          <li>UK International Data Transfer Agreement (IDTA) where applicable</li>
        </ul>
  </>
);
