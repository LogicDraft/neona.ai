export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#212121] text-gray-800 dark:text-gray-200 py-12 px-6 sm:px-8 flex justify-center">
      <article className="max-w-2xl w-full space-y-10">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Last updated: May 2026
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-2">
            This Privacy Policy describes how Neona collects, uses, and protects your information when you use our application. We are committed to ensuring your privacy is protected and your data is handled transparently.
          </p>
        </div>

        {/* Section: Data We Collect */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            1. Data We Collect
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>We only process data that is necessary to provide our services to you. This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Account & OAuth Information:</strong> Basic profile information and authentication tokens required to securely integrate with Google services.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Chat Prompts:</strong> The text and queries you submit to the AI in order to generate responses.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">Scheduling Metadata:</strong> Calendar events, times, and preferences necessary to manage your schedule.
              </li>
            </ul>
          </div>
        </div>

        {/* Section: How We Use Your Data */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            2. How We Use Your Data
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>The information we collect is strictly used to operate, maintain, and improve the application:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide contextual AI responses based on your chat prompts.</li>
              <li>To seamlessly read or create events on your integrated calendar.</li>
              <li>To troubleshoot issues, detect bugs, and enhance the overall user interface.</li>
            </ul>
          </div>
        </div>

        {/* Section: Third-Party Services */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            3. Third-Party Integrations
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Neona utilizes third-party APIs (such as Google Calendar and AI language models) to function. Data shared with these services is strictly limited to what is required to fulfill your direct requests. We do not sell your personal data to advertisers or data brokers.
          </p>
        </div>

        {/* Section: Your Rights */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            4. Your Rights & Data Retention
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            You maintain full control over your data. You can revoke Google OAuth permissions at any time via your Google Account security settings. If you wish to have your account or stored data permanently deleted from our servers, you may contact us directly.
          </p>
        </div>

        {/* Section: Contact */}
        <div className="space-y-4 pb-8">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            5. Contact Us
          </h2>
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions about this privacy policy, privacy requests, or how your data is handled, please reach out to us at:
            </p>
            <a 
              href="mailto:gowdagowtham1025@gmail.com"
              className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
            >
              gowdagowtham1025@gmail.com
            </a>
          </div>
        </div>

      </article>
    </main>
  );
}