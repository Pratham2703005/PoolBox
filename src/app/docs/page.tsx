import React from 'react';
import Link from 'next/link';
import { TOOLS, CATEGORIES } from '@/lib/constants';

export default function DocsPage() {
  const getToolSlug = (href: string) => {
    const parts = href.split('/');
    return parts[parts.length - 1];
  };

  const toolsByCategory = TOOLS.reduce((acc, tool) => {
    if (tool.href.startsWith('http')) return acc; // Skip external links
    
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof TOOLS>);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          📚 Documentation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Comprehensive guides and documentation for all tools
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(toolsByCategory).map(([category, tools]) => (
          <section key={category}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">{CATEGORIES[category as keyof typeof CATEGORIES].icon}</span>
              {CATEGORIES[category as keyof typeof CATEGORIES].name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/docs/${getToolSlug(tool.href)}`}
                  className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{tool.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
