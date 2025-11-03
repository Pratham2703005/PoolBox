// Figma API Constants

export const FIGMA_API_BASE_URL = 'https://api.figma.com/v1';

// Spacing Scale Mapping (Figma px -> Tailwind class)
export const SPACING_MAP: Record<number, string> = {
  0: 'gap-0',
  2: 'gap-0.5',
  4: 'gap-1',
  6: 'gap-1.5',
  8: 'gap-2',
  10: 'gap-2.5',
  12: 'gap-3',
  14: 'gap-3.5',
  16: 'gap-4',
  20: 'gap-5',
  24: 'gap-6',
  28: 'gap-7',
  32: 'gap-8',
  36: 'gap-9',
  40: 'gap-10',
  44: 'gap-11',
  48: 'gap-12',
  56: 'gap-14',
  64: 'gap-16',
  80: 'gap-20',
  96: 'gap-24',
  112: 'gap-28',
  128: 'gap-32',
};

// Padding Mapping (similar to spacing)
export const PADDING_MAP: Record<number, string> = {
  0: 'p-0',
  2: 'p-0.5',
  4: 'p-1',
  6: 'p-1.5',
  8: 'p-2',
  10: 'p-2.5',
  12: 'p-3',
  14: 'p-3.5',
  16: 'p-4',
  20: 'p-5',
  24: 'p-6',
  28: 'p-7',
  32: 'p-8',
  36: 'p-9',
  40: 'p-10',
  44: 'p-11',
  48: 'p-12',
  56: 'p-14',
  64: 'p-16',
  80: 'p-20',
  96: 'p-24',
};

// Font Weight Mapping
export const FONT_WEIGHT_MAP: Record<number, string> = {
  100: 'font-thin',
  200: 'font-extralight',
  300: 'font-light',
  400: 'font-normal',
  500: 'font-medium',
  600: 'font-semibold',
  700: 'font-bold',
  800: 'font-extrabold',
  900: 'font-black',
};

// Text Alignment Mapping
export const TEXT_ALIGN_MAP: Record<string, string> = {
  LEFT: 'text-left',
  CENTER: 'text-center',
  RIGHT: 'text-right',
  JUSTIFIED: 'text-justify',
};

// Border Radius Mapping
export const BORDER_RADIUS_MAP: Record<number, string> = {
  0: 'rounded-none',
  2: 'rounded-sm',
  4: 'rounded',
  6: 'rounded-md',
  8: 'rounded-lg',
  12: 'rounded-xl',
  16: 'rounded-2xl',
  24: 'rounded-3xl',
  9999: 'rounded-full',
};

// Primary Axis Alignment Mapping
export const PRIMARY_AXIS_ALIGN_MAP: Record<string, string> = {
  MIN: 'justify-start',
  CENTER: 'justify-center',
  MAX: 'justify-end',
  SPACE_BETWEEN: 'justify-between',
};

// Counter Axis Alignment Mapping
export const COUNTER_AXIS_ALIGN_MAP: Record<string, string> = {
  MIN: 'items-start',
  CENTER: 'items-center',
  MAX: 'items-end',
};

// Node Type to HTML Element Mapping
export const NODE_TYPE_MAP: Record<string, string> = {
  FRAME: 'div',
  GROUP: 'div',
  RECTANGLE: 'div',
  TEXT: 'p',
  VECTOR: 'svg',
  INSTANCE: 'div',
  COMPONENT: 'div',
  CANVAS: 'div',
  ELLIPSE: 'div',
  LINE: 'div',
  STAR: 'div',
  REGULAR_POLYGON: 'div',
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid Personal Access Token. Please check your token and try again.',
  INVALID_URL: 'Invalid Figma URL. Please provide a valid Figma file link.',
  FILE_NOT_FOUND: 'Figma file not found. Ensure the file is accessible with this token.',
  RATE_LIMIT: 'API rate limit reached. Please try again in a few minutes.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TRANSLATION_ERROR: 'Error translating design. The file may contain unsupported features.',
  TIMEOUT: 'Request timeout. The file may be too large. Try with a smaller file.',
  API_ERROR: 'Figma API error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Processing Stage Messages
export const STAGE_MESSAGES = {
  idle: 'Ready to extract',
  connecting: 'Connecting to Figma API...',
  fetching: 'Fetching file data...',
  translating: 'Translating components...',
  assets: 'Generating asset URLs...',
  finalizing: 'Finalizing components...',
  complete: 'Extraction complete!',
  error: 'Error occurred',
};

// API Configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  maxAssetBatchSize: 100, // Max node IDs per asset request
};

// Component Generation
export const COMPONENT_CONFIG = {
  defaultIndentSize: 2,
  maxComponentNameLength: 50,
  reservedNames: ['export', 'default', 'import', 'function', 'const', 'let', 'var'],
};

// Tailwind Class Priority (for ordering)
export const CLASS_PRIORITY = {
  display: 0,
  position: 1,
  layout: 2,
  spacing: 3,
  sizing: 4,
  typography: 5,
  background: 6,
  border: 7,
  effects: 8,
  transforms: 9,
  transitions: 10,
};
