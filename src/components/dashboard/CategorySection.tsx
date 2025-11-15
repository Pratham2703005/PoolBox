'use client';

import React from 'react';
import { Tool, ToolCategory } from '@/types/tools';
import { ToolGrid } from './ToolGrid';
import { CATEGORIES } from '@/lib/constants';

interface CategorySectionProps {
  category: ToolCategory;
  tools: Tool[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  tools,
}) => {
  const categoryInfo = CATEGORIES[category];

  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{categoryInfo.icon}</div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {categoryInfo.name}
          </h2>
          <p className="text-sm text-gray-400">
            {categoryInfo.description}
          </p>
        </div>
      </div>
      <ToolGrid tools={tools} />
    </section>
  );
};
