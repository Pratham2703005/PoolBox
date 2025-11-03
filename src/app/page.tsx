'use client';

import  { useState, useMemo } from 'react';
import { TOOLS, CATEGORIES } from '@/lib/constants';
import { ToolGrid } from '@/components/dashboard/ToolGrid';
import { CategorySection } from '@/components/dashboard/CategorySection';
import { useToolStore } from '@/lib/store';
import { Tool } from '@/types/tools';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function Home() {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { starredTools, addSearchHistory } = useToolStore();

  const starredToolsList = useMemo(() => {
    return TOOLS.filter((tool) => starredTools.has(tool.id));
  }, [starredTools]);

  const filteredTools = useMemo(() => {
    let filtered = TOOLS;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((tool) => tool.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const toolsByCategory = useMemo(() => {
    const grouped = new Map<string, Tool[]>();

    Object.keys(CATEGORIES).forEach((category) => {
      grouped.set(
        category,
        filteredTools.filter((tool) => tool.category === category)
      );
    });

    return grouped;
  }, [filteredTools]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addSearchHistory(query);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const isFiltering = searchQuery || selectedCategory;
  const mounted = useIsMounted();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Developer Toolbox
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            20+ tools to supercharge your development workflow. All in one place.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-500" />
              </div>
              {mounted && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search tools... (e.g., jwt, csv, regex)"
                />
              )}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Tools
            </button>
            {Object.values(CATEGORIES).map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-12">
          {/* Starred Tools Section */}
          {!isFiltering && starredToolsList.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⭐</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Starred Tools
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your favorite tools for quick access
                  </p>
                </div>
              </div>
              <ToolGrid tools={starredToolsList} />
            </section>
          )}

          {/* Tools by Category */}
          {isFiltering ? (
            // When filtering, show all results in a single grid
            <div>
              {filteredTools.length > 0 ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ToolGrid tools={filteredTools} />
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No tools found</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          ) : (
            // When not filtering, show organized by category
            <>
              {Array.from(toolsByCategory.entries()).map(([category, tools]) => (
                tools.length > 0 && (
                  <CategorySection
                    key={category}
                    category={category as Parameters<typeof CategorySection>[0]['category']}
                    tools={tools}
                  />
                )
              ))}
            </>
          )}
        </div>

        {/* Stats Section */}
        {!isFiltering && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {TOOLS.length}+
              </div>
              <p className="text-gray-600 dark:text-gray-400">Tools Available</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Object.keys(CATEGORIES).length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Categories</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {starredToolsList.length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Starred Tools</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}