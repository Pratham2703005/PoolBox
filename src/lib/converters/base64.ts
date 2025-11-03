/**
 * Base64 Encoder/Decoder Utilities
 * Handles encoding, decoding, and content type detection
 * Robust error handling for all input formats
 */

export type Base64ContentType = "text" | "image" | "json" | "base64-encoded" | "unknown";

export interface Base64Content {
  type: Base64ContentType;
  data: string;
  mimeType?: string;
  format?: string; // png, jpeg, etc.
  isDataUrl?: boolean; // Whether original was data:// URL
}

export interface ConversionStats {
  originalSize: number;
  encodedSize: number;
  increasePercent: number;
}

/**
 * Extract Base64 from data URL if present
 * Handles: data:image/png;base64,xxxxx => xxxxx
 */
export function extractBase64FromDataUrl(input: string): { base64: string; mimeType?: string; isDataUrl: boolean } {
  const trimmed = input.trim();
  
  if (trimmed.startsWith("data:")) {
    const match = trimmed.match(/^data:([^;]+)?(?:;base64)?,(.+)$/);
    if (match) {
      return {
        base64: match[2],
        mimeType: match[1],
        isDataUrl: true,
      };
    }
  }
  
  return {
    base64: trimmed,
    isDataUrl: false,
  };
}

/**
 * Encode text to Base64 - SAFE
 */
export function encodeToBase64(text: string): string {
  try {
    // Use a more robust encoding method
    const utf8Encoded = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < utf8Encoded.byteLength; i++) {
      binary += String.fromCharCode(utf8Encoded[i]);
    }
    return btoa(binary);
  } catch {
    throw new Error("Failed to encode text to Base64");
  }
}

/**
 * Decode Base64 to text - SAFE with fallback
 */
export function decodeFromBase64(base64: string): string {
  try {
    // First, try standard UTF-8 decoding
    const binaryString = atob(base64.trim());
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoded = new TextDecoder().decode(bytes);
    return decoded;
  } catch {
    try {
      // Fallback to legacy method
      return decodeURIComponent(escape(atob(base64.trim())));
    } catch {
      throw new Error("Invalid Base64 string");
    }
  }
}

/**
 * Check if a string is valid Base64 - SAFE
 */
export function isValidBase64(str: string): boolean {
  try {
    // Check format
    const base64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;
    if (!base64Regex.test(str.trim())) {
      return false;
    }
    
    // Try to decode it
    const testDecode = atob(str.trim());
    return testDecode !== null;
  } catch {
    return false;
  }
}

/**
 * Detect if input is likely Base64 or plain text
 * Strategy: Base64 is ONLY alphanumeric + a few special chars, nothing else
 * Plain text can have spaces, punctuation, etc.
 */
export function isLikelyBase64(input: string): boolean {
  const trimmed = input.trim();
  
  // Empty input
  if (!trimmed) return false;
  
  // Data URL is always base64
  if (trimmed.startsWith("data:")) {
    return true;
  }
  
  // Check for image signatures
  const imageSignatures = ["iVBORw0KGgo", "/9j/", "Qk0", "R0lGODlh", "Ug0EK"];
  if (imageSignatures.some(sig => trimmed.startsWith(sig))) {
    return true;
  }
  
  // Remove all whitespace to check the actual content
  const cleanedBase64 = trimmed.replace(/\s/g, '');
  
  // Check if contains ONLY valid Base64 characters (after removing whitespace)
  const validBase64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;
  if (!validBase64Regex.test(cleanedBase64)) {
    return false; // Has invalid characters
  }
  
  // Must be at least 4 characters long to be valid Base64
  if (cleanedBase64.length < 4) {
    return false;
  }
  
  // Check if it looks like plain text with spaces and punctuation
  // This is the only case where we'd reject valid-looking Base64
  const hasSpaces = /\s/.test(trimmed);
  const hasPunctuation = /[.!?;:,'"()\-—–]/.test(trimmed);
  
  if (hasSpaces && hasPunctuation) {
    // Likely plain text with sentences, not Base64
    return false;
  }
  
  // If it has spaces but no punctuation, could be multiline Base64
  // Accept it as Base64
  return true;
}

/**
 * Safely detect content type WITHOUT decoding
 * This function only checks signatures, does NOT attempt to decode
 */
export function detectContentType(base64: string): Base64ContentType {
  try {
    const trimmed = base64.trim();
    let actualBase64 = trimmed;
    let mimeType: string | undefined;
    
    // Extract from data URL if needed
    if (trimmed.startsWith("data:")) {
      const extracted = extractBase64FromDataUrl(trimmed);
      actualBase64 = extracted.base64;
      mimeType = extracted.mimeType;
    }
    
    // Check MIME type from data URL
    if (mimeType) {
      if (mimeType.startsWith("image/")) return "image";
      if (mimeType.includes("json")) return "json";
    }
    
    // Check for image signatures (without decoding)
    const imageSignatures: Record<string, string> = {
      "iVBORw0KGgo": "image", // PNG
      "/9j/": "image", // JPEG
      "Qk0": "image", // BMP
      "R0lGODlh": "image", // GIF
      "Ug0EK": "image", // WebP
    };
    
    for (const [sig] of Object.entries(imageSignatures)) {
      if (actualBase64.startsWith(sig)) {
        return "image";
      }
    }
    
    // If it matches base64 pattern, assume it's text
    // Don't try to decode - that's the caller's job
    if (/^[A-Za-z0-9+/\-_]*={0,2}$/.test(actualBase64)) {
      return "text"; // Assume text, let decoder figure it out
    }
    
    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Parse Base64 content with mime type detection - ROBUST
 */
export function parseBase64Content(input: string): Base64Content {
  try {
    const { base64, mimeType: extractedMimeType, isDataUrl } = extractBase64FromDataUrl(input);
    const type = detectContentType(input);
    
    if (type === "image") {
      const detectedMimeType = extractedMimeType || detectImageMimeType(base64) || "image/png";
      const format = detectedMimeType.split("/")[1] || "png";
      return {
        type: "image",
        data: base64,
        mimeType: detectedMimeType,
        format,
        isDataUrl,
      };
    }
    
    if (type === "json") {
      try {
        const decoded = decodeFromBase64(base64);
        return {
          type: "json",
          data: decoded,
          mimeType: "application/json",
          isDataUrl,
        };
      } catch {
        return {
          type: "unknown",
          data: base64,
          isDataUrl,
        };
      }
    }
    
    if (type === "text") {
      try {
        const decoded = decodeFromBase64(base64);
        return {
          type: "text",
          data: decoded,
          isDataUrl,
        };
      } catch {
        return {
          type: "unknown",
          data: base64,
          isDataUrl,
        };
      }
    }
    
    return {
      type: "unknown",
      data: base64,
      isDataUrl,
    };
  } catch {
    return {
      type: "unknown",
      data: input,
    };
  }
}

/**
 * Detect image MIME type from Base64 signature
 */
export function detectImageMimeType(base64: string): string | null {
  const imageSignatures: Record<string, string> = {
    "iVBORw0KGgo": "image/png",
    "/9j/": "image/jpeg",
    "Qk0": "image/bmp",
    "R0lGODlh": "image/gif",
    "Ug0EK": "image/webp",
  };
  
  for (const [sig, mimeType] of Object.entries(imageSignatures)) {
    if (base64.startsWith(sig)) {
      return mimeType;
    }
  }
  
  return null;
}

/**
 * Check if string is valid JSON - SAFE
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format JSON for display
 */
export function formatJSON(json: string, indent: number = 2): string {
  try {
    return JSON.stringify(JSON.parse(json), null, indent);
  } catch {
    return json;
  }
}

/**
 * Calculate conversion statistics
 */
export function calculateStats(originalText: string, encodedBase64: string): ConversionStats {
  try {
    const originalSize = new Blob([originalText]).size;
    const encodedSize = new Blob([encodedBase64]).size;
    const increasePercent = 
      originalSize > 0 ? ((encodedSize - originalSize) / originalSize) * 100 : 0;
    
    return {
      originalSize,
      encodedSize,
      increasePercent: Math.round(increasePercent * 100) / 100,
    };
  } catch {
    return {
      originalSize: 0,
      encodedSize: 0,
      increasePercent: 0,
    };
  }
}

/**
 * Convert Base64 to Data URL
 */
export function toDataURL(base64: string, mimeType: string = "text/plain"): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Generate HTML img tag with Base64 image
 */
export function toImgTag(base64: string, mimeType: string = "image/png", alt: string = "Image"): string {
  const dataUrl = toDataURL(base64, mimeType);
  return `<img src="${dataUrl}" alt="${alt}" />`;
}

/**
 * Extract mime type from data URL
 */
export function extractMimeTypeFromDataURL(dataUrl: string): string | null {
  const match = dataUrl.match(/data:([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Convert file to Base64
 * Reads file as binary and converts to Base64 for accurate representation
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        // Read as ArrayBuffer to get raw binary data
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        // Convert bytes directly to Base64 string
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode(...Array.from(chunk));
        }
        
        // Use btoa to create Base64
        const base64 = btoa(binary);
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    
    // Read as ArrayBuffer for binary-accurate encoding
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert Base64 to Blob - SAFE
 */
export function base64ToBlob(base64: string, mimeType: string = "application/octet-stream"): Blob {
  try {
    const binaryString = atob(base64.trim());
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  } catch {
    return new Blob([base64], { type: mimeType });
  }
}

/**
 * Download Base64 as file
 */
export function downloadBase64(base64: string, filename: string, mimeType: string = "application/octet-stream"): void {
  try {
    const blob = base64ToBlob(base64, mimeType);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    // Download failed silently
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
