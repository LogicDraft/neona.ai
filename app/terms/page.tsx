export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#212121] text-gray-800 dark:text-gray-200 py-12 px-6 sm:px-8 flex justify-center">
      <article className="max-w-2xl w-full space-y-10">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Terms of Use
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Last updated: May 2026
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> These Terms of Use are currently placeholders. Please replace this content with your official legal text before a public production launch.
            </p>
          </div>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By accessing or using the Neona application, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using or accessing this service.
          </p>
        </div>

        {/* Section 2: Description of Service */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            2. Description of Service
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Neona provides an AI-powered conversational interface and productivity tools, including but not limited to calendar integration and scheduling assistants. The service is subject to modification, updates, or discontinuation at our sole discretion without prior notice.
          </p>
        </div>

        {/* Section 3: User Conduct */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            3. User Conduct
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>You agree to use the application only for lawful purposes. You are strictly prohibited from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Using the service to generate, distribute, or promote illegal, harmful, or abusive content.</li>
              <li>Attempting to interfere with, compromise the system integrity, or decipher any transmissions to or from the servers running the application.</li>
              <li>Impersonating another person or misrepresenting your affiliation with a person or entity.</li>
              <li>Bypassing the measures we may use to prevent or restrict access to the service.</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Disclaimer of Warranties */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            4. Disclaimer of Warranties
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed uppercase text-sm tracking-wider font-semibold">
            The materials on Neona's application are provided on an "as is" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </div>

        {/* Section 5: Limitation of Liability */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            5. Limitation of Liability
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            In no event shall Neona, its developers, or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the application, even if we have been notified orally or in writing of the possibility of such damage.
          </p>
        </div>

        {/* Section 6: Contact */}
        <div className="space-y-4 pb-8">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            6. Contact Information
          </h2>
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions regarding these Terms of Use, please contact us at:
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