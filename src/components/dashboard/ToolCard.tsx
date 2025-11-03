'use client';

import React from 'react';
import { Tool } from '@/types/tools';
import { FaStar, FaRegStar } from 'react-icons/fa';
import Link from 'next/link';
import { CATEGORY_BADGE_COLORS } from '@/lib/constants';
import { useToolStore } from '@/lib/store';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { toggleStarred, isStarred } = useToolStore();
  const starred = isStarred(tool.id);

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleStarred(tool.id);
  };

  return (
    <Link href={tool.href}>
      <div className="group relative h-full rounded-lg border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 hover:dark:border-blue-600 hover:dark:shadow-blue-900/20 cursor-pointer">
        {/* Featured badge */}
        {tool.featured && (
          <div className="absolute -top-2 -right-2 bg-transparent text-xs font-bold px-2 py-1 rounded-full">
            ✨
          </div>
        )}

        {/* Coming Soon badge */}
        {tool.comingSoon && (
          <div className="absolute top-2 right-2 bg-gray-300 text-gray-700 text-xs font-semibold px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-300">
            Coming Soon
          </div>
        )}

        {/* Star button */}
        <button
          onClick={handleStarClick}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
          aria-label={starred ? 'Remove from favorites' : 'Add to favorites'}
        >
          {starred ? (
            <FaStar className="w-5 h-5 text-yellow-400" />
          ) : (
            <FaRegStar className="w-5 h-5 text-gray-400 hover:text-yellow-400 transition-colors" />
          )}
        </button>

        <div className="space-y-3">
          {/* Icon and title */}
          <div className="flex items-start gap-3">
            <div className="text-3xl flex-shrink-0">{tool.icon}</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {tool.description}
          </p>

          {/* Category badge */}
          <div className="flex items-center gap-2 pt-2">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORY_BADGE_COLORS[tool.category]}`}>
              {tool.category
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </span>
          </div>

          {/* Tags */}
          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tool.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
              {tool.tags.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{tool.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Disabled overlay for coming soon */}
        {tool.comingSoon && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-10 rounded-lg backdrop-blur-[1px]" />
        )}
      </div>
    </Link>
  );
};
