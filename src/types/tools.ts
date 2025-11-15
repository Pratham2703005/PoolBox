export type ToolCategory =
  | "conversion"
  | "files"
  | "code"
  | "dev-utils"
  | "generators"
  | "advanced";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string; // Emoji or icon name
  href: string;
  tags: string[];
  featured?: boolean;
  comingSoon?: boolean;
  color?: string; // Tailwind color for category badge
  apiAvailable?: boolean;
  docAvailable?: boolean;
}

export interface ToolWithStarred extends Tool {
  isStarred: boolean;
}

export interface Category {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  autoFormat: boolean;
  clipboardNotifications: boolean;
  defaultFormat: string;
}

export interface RecentTool {
  toolId: string;
  timestamp: number;
  params?: Record<string, unknown>;
}
