'use client';

import React from 'react';
import { Tool } from '@/types/tools';
import { ToolCard } from './ToolCard';

interface ToolGridProps {
  tools: Tool[];
  emptyMessage?: string;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  emptyMessage = 'No tools found',
}) => {
  if (tools.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
};
