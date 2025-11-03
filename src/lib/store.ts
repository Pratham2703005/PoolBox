'use client';

import { create } from 'zustand';
import { UserPreferences, RecentTool } from '@/types/tools';

interface ToolStore {
  // Starred tools
  starredTools: Set<string>;
  toggleStarred: (toolId: string) => void;
  isStarred: (toolId: string) => boolean;

  // User preferences
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // Recent tools
  recentTools: RecentTool[];
  addRecentTool: (toolId: string, params?: Record<string, unknown>) => void;
  clearRecentTools: () => void;

  // Search history
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

export const useToolStore = create<ToolStore>((set, get) => ({
  // Starred tools
  starredTools: new Set(),
  toggleStarred: (toolId: string) => {
    set((state) => {
      const newStarred = new Set(state.starredTools);
      if (newStarred.has(toolId)) {
        newStarred.delete(toolId);
      } else {
        newStarred.add(toolId);
      }
      return { starredTools: newStarred };
    });
  },
  isStarred: (toolId: string) => {
    return get().starredTools.has(toolId);
  },

  // User preferences
  preferences: {
    theme: 'system',
    autoFormat: true,
    clipboardNotifications: true,
    defaultFormat: 'json',
  },
  updatePreferences: (prefs: Partial<UserPreferences>) => {
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    }));
  },

  // Recent tools
  recentTools: [],
  addRecentTool: (toolId: string, params?: Record<string, unknown>) => {
    set((state) => {
      // Remove if already exists
      const filtered = state.recentTools.filter((t) => t.toolId !== toolId);
      // Add to beginning with timestamp
      const updated = [
        { toolId, timestamp: Date.now(), params },
        ...filtered,
      ];
      // Keep only last 10
      return { recentTools: updated.slice(0, 10) };
    });
  },
  clearRecentTools: () => {
    set({ recentTools: [] });
  },

  // Search history
  searchHistory: [],
  addSearchHistory: (query: string) => {
    if (!query.trim()) return;
    set((state) => {
      const filtered = state.searchHistory.filter(
        (q) => q.toLowerCase() !== query.toLowerCase()
      );
      const updated = [query, ...filtered];
      return { searchHistory: updated.slice(0, 15) };
    });
  },
  clearSearchHistory: () => {
    set({ searchHistory: [] });
  },
}));
