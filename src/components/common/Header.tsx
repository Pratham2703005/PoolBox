'use client';

import React from 'react';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl">🧰</div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Toolbox
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Developer Tools</p>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="https://pratham-potfolio.vercel.app"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              About Me
            </Link>
            <a
              href="https://github.com/Pratham2703005"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </nav>

          
        </div>
      </div>
    </header>
  );
};
