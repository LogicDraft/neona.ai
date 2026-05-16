import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#212121] text-gray-800 dark:text-gray-200 py-12 px-6 sm:px-8 flex justify-center">
      <article className="max-w-2xl w-full space-y-10">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Help Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Need help with Neona? Reach out through the channels below and we will get back to you.
          </p>
        </div>

        {/* Contact Support Card */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 space-y-4 shadow-sm">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Contact Support
          </h2>
          <div className="flex flex-col space-y-3">
            <a 
              href="https://github.com/LogicDraft" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Github:</span> 
              https://github.com/LogicDraft
            </a>
            <a 
              href="mailto:gowdagowtham1025@gmail.com"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Email:</span> 
              gowdagowtham1025@gmail.com
            </a>
          </div>
        </div>

        {/* Policies & Links Section */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            Legal & Policies
          </h2>
          <div className="flex flex-col space-y-4 pt-2">
            <Link 
              href="/terms" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
            >
              Terms of use
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
            >
              Privacy policy
            </Link>
            <Link 
              href="/licenses" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
            >
              Licenses
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
            >
              About
            </Link>
          </div>
        </div>

      </article>
    </main>
  );
}