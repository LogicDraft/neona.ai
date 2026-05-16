export default function LicensesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#212121] text-gray-800 dark:text-gray-200 py-12 px-6 sm:px-8 flex justify-center">
      <article className="max-w-2xl w-full space-y-10">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Licenses & Attributions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Neona is made possible by the open-source community. Below is a list of third-party software, libraries, and resources used in this project, along with their respective licenses.
          </p>
        </div>

        {/* Open Source Acknowledgements */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            Open Source Acknowledgements
          </h2>
          
          <div className="space-y-6 pt-4">
            
            {/* Package 1: Next.js */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col space-y-2">
              <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Next.js</h3>
                <span className="text-xs font-mono bg-gray-200 dark:bg-white/10 px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300">
                  MIT License
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Copyright (c) 2024 Vercel, Inc.
              </p>
            </div>

            {/* Package 2: React */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col space-y-2">
              <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">React</h3>
                <span className="text-xs font-mono bg-gray-200 dark:bg-white/10 px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300">
                  MIT License
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Copyright (c) Meta Platforms, Inc. and affiliates.
              </p>
            </div>

            {/* Package 3: Tailwind CSS */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col space-y-2">
              <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tailwind CSS</h3>
                <span className="text-xs font-mono bg-gray-200 dark:bg-white/10 px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300">
                  MIT License
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Copyright (c) Tailwind Labs, Inc.
              </p>
            </div>

          </div>
        </div>

        {/* Standard MIT License Text Reference */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
            Standard MIT License
          </h2>
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-mono">
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
              <br /><br />
              The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
            </p>
          </div>
        </div>

      </article>
    </main>
  );
}