// Figma API Response Types

export interface FigmaFile {
  name: string;
  lastModified: string;
  version: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  schemaVersion: number;
  styles: Record<string, FigmaStyle>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: NodeType;
  visible?: boolean;
  children?: FigmaNode[];
  absoluteBoundingBox?: BoundingBox;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  characters?: string;
  style?: TextStyle;
  effects?: Effect[];
  opacity?: number;
  blendMode?: BlendMode;
  layoutGrow?: number;
  layoutAlign?: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH';
  constraints?: Constraints;
  clipsContent?: boolean;
  background?: Paint[];
  backgroundColor?: Color;
}

export type NodeType =
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'VECTOR'
  | 'BOOLEAN_OPERATION'
  | 'STAR'
  | 'LINE'
  | 'ELLIPSE'
  | 'REGULAR_POLYGON'
  | 'RECTANGLE'
  | 'TEXT'
  | 'SLICE'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE'
  | 'STICKY'
  | 'SHAPE_WITH_TEXT';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Paint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';
  visible?: boolean;
  opacity?: number;
  color?: Color;
  gradientStops?: ColorStop[];
  scaleMode?: 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
  imageRef?: string;
}

export interface Color {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
  a: number; // 0-1
}

export interface ColorStop {
  position: number; // 0-1
  color: Color;
}

export interface TextStyle {
  fontFamily?: string;
  fontPostScriptName?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
}

export interface Effect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius?: number;
  color?: Color;
  blendMode?: BlendMode;
  offset?: { x: number; y: number };
  spread?: number;
}

export type BlendMode =
  | 'NORMAL'
  | 'DARKEN'
  | 'MULTIPLY'
  | 'LINEAR_BURN'
  | 'COLOR_BURN'
  | 'LIGHTEN'
  | 'SCREEN'
  | 'LINEAR_DODGE'
  | 'COLOR_DODGE'
  | 'OVERLAY'
  | 'SOFT_LIGHT'
  | 'HARD_LIGHT'
  | 'DIFFERENCE'
  | 'EXCLUSION'
  | 'HUE'
  | 'SATURATION'
  | 'COLOR'
  | 'LUMINOSITY';

export interface Constraints {
  horizontal: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
  vertical: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: string;
  description: string;
}

// Asset/Image Types

export interface FigmaImageResponse {
  images: Record<string, string>; // nodeId -> url
  err?: string;
}

export interface AssetUrl {
  id: string;
  name: string;
  type: 'PNG' | 'JPG' | 'SVG' | 'PDF';
  url: string;
  width?: number;
  height?: number;
}

// Translation Engine Types

export interface JSXElement {
  type: string;
  props: Record<string, unknown>;
  styles: string[];
  children: JSXElement[];
  content?: string;
}

export interface GeneratedComponent {
  name: string;
  jsx: string;
  nodeId: string;
  stats?: {
    lines: number;
    elements: number;
  };
}

export interface ExtractResult {
  success: true;
  data: {
    components: GeneratedComponent[];
    assets: AssetUrl[];
    rawData: FigmaFile;
    metadata: {
      totalPages: number;
      totalAssets: number;
      processingTime: number;
      fileName: string;
      lastModified: string;
    };
  };
}

export interface ExtractError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ExtractResponse = ExtractResult | ExtractError;

export type ErrorCode =
  | 'INVALID_TOKEN'
  | 'INVALID_URL'
  | 'FILE_NOT_FOUND'
  | 'API_ERROR'
  | 'RATE_LIMIT'
  | 'NETWORK_ERROR'
  | 'TRANSLATION_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

// Request Types

export interface ExtractRequest {
  figmaUrl: string;
  personalAccessToken: string;
}

// Translation Configuration

export interface TranslationConfig {
  indentSize: number;
  useArbitraryValues: boolean;
  generateComments: boolean;
  formatCode: boolean;
  componentNamePrefix?: string;
}

// Processing State

export interface ProcessingState {
  stage: ProcessingStage;
  progress: number; // 0-100
  message: string;
  startTime: number;
}

export type ProcessingStage =
  | 'idle'
  | 'connecting'
  | 'fetching'
  | 'translating'
  | 'assets'
  | 'finalizing'
  | 'complete'
  | 'error';
