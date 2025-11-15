'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS } from '@/lib/constants';

interface SidebarProps {
  type: 'docs' | 'apis';
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const pathname = usePathname();

  const getToolSlug = (href: string) => {
    const parts = href.split('/');
    return parts[parts.length - 1];
  };

  return (
    <aside className="w-[20rem] ml-10 border border-gray-800 bg-gray-900/20 h-[calc(100vh-7rem)] sticky top-22 overflow-y-auto rounded-xl text-center">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {type === 'docs' ? 'Documentations' : '🔌 API Reference'}
        </h2>
        
        <nav className="space-y-1">
          {TOOLS.map((tool) => {
            if (tool.href.startsWith('http') || (type === 'docs' && !tool.docAvailable) || (type === 'apis' && !tool.apiAvailable)) return null; // Skip external links
            
            const toolSlug = getToolSlug(tool.href);
            const isActive = pathname === `/${type}/${toolSlug}`;
            
            return (
              <Link
                key={tool.id}
                href={`/${type}/${toolSlug}`}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <span className="flex-1">{tool.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
