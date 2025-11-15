import React from 'react';
import Link from 'next/link';
import { TOOLS, CATEGORIES } from '@/lib/constants';

export default function APIsPage() {
  const getToolSlug = (href: string) => {
    const parts = href.split('/');
    return parts[parts.length - 1];
  };

  // Only show tools that have API endpoints
  const toolsWithAPIs = TOOLS.filter(tool => !tool.href.startsWith('http'));
  
  const toolsByCategory = toolsWithAPIs.reduce((acc, tool) => {
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
          🔌 API Reference
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Complete API documentation with examples and schemas
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
                  href={`/apis/${getToolSlug(tool.href)}`}
                  className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{tool.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        API endpoint and usage examples
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
