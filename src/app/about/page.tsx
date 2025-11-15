import React from 'react';
import { FaGithub, FaGlobe } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            👋 About Toolbox
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A collection of developer tools built with passion
          </p>
        </div>

        <div className="space-y-8">
          {/* Project Description */}
          <section className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🛠️ What is Toolbox?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Toolbox is a comprehensive collection of developer utilities and tools designed to make your development workflow faster and more efficient. 
              From data conversion to code formatting, image processing to API testing - we&apos;ve got you covered.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              All tools are free to use, open-source, and work entirely in your browser with no server-side processing for maximum privacy and speed.
            </p>
          </section>

          {/* Features */}
          <section className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ✨ Features
            </h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Privacy First:</strong> All processing happens in your browser</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>No Installation:</strong> Access tools instantly from any browser</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>API Access:</strong> Programmatic access to tools for automation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Dark Mode:</strong> Easy on the eyes, day or night</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Open Source:</strong> Contribute and customize as you like</span>
              </li>
            </ul>
          </section>

          {/* Tech Stack */}
          <section className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              💻 Built With
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Next.js 14</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚛️</span>
                <span>React 18</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎨</span>
                <span>Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📘</span>
                <span>TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚀</span>
                <span>Vercel</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎭</span>
                <span>Zustand</span>
              </div>
            </div>
          </section>

          {/* Developer */}
          <section className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              👨‍💻 Developer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Created and maintained by Pratham Kumar
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/Pratham2703005"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FaGithub />
                <span>GitHub</span>
              </a>
              <a
                href="https://pratham-potfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FaGlobe />
                <span>Portfolio</span>
              </a>
            </div>
          </section>

          {/* Contribute */}
          <section className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🤝 Contribute
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Toolbox is open source! We welcome contributions, bug reports, and feature requests.
            </p>
            <a
              href="https://github.com/Pratham2703005/PoolBox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
            >
              <FaGithub />
              <span>View on GitHub</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
