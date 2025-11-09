export type DotType = "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded";
export type CornerSquareType = "dot" | "square" | "extra-rounded";
export type CornerDotType = "dot" | "square";
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type Mode = "Numeric" | "Alphanumeric" | "Byte" | "Kanji";

export interface QRStylingOptions {
  // Main options
  width: number;
  height: number;
  data: string;
  margin: number;
  
  // QR Options
  qrOptions: {
    typeNumber: number;
    mode: Mode;
    errorCorrectionLevel: ErrorCorrectionLevel;
  };
  
  // Image options
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    crossOrigin: string;
    margin: number;
  };
  
  // Dots options
  dotsOptions: {
    color: string;
    gradient?: {
      type: "linear" | "radial";
      rotation?: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
    type: DotType;
  };
  
  // Background options
  backgroundOptions: {
    color: string;
    gradient?: {
      type: "linear" | "radial";
      rotation?: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
  };
  
  // Corner square options
  cornersSquareOptions: {
    color: string;
    gradient?: {
      type: "linear" | "radial";
      rotation?: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
    type: CornerSquareType;
  };
  
  // Corner dots options
  cornersDotOptions: {
    color: string;
    gradient?: {
      type: "linear" | "radial";
      rotation?: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
    type: CornerDotType;
  };
  
  image?: string;
}

export interface QRStylePreset {
  name: string;
  description: string;
  options: Partial<QRStylingOptions>;
}
