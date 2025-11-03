/**
 * Base Conversion Utilities
 * Handles conversions between different number bases and text encodings
 */

import {
  NumberBase,
  TextEncoding,
  BaseConversionResult,
  TextConversionResult,
  ByteGroup,
  BitExplanation,
  CodeSnippet,
} from '@/types/base-converter';

/**
 * Detect the base of input string
 * Returns detected base or null if ambiguous
 */
export function detectInputBase(input: string): NumberBase | null {
  const trimmed = input.trim();
  
  // Binary: only 0s and 1s
  if (/^[01]+$/.test(trimmed)) {
    return 2;
  }
  
  // Hex: starts with 0x or contains only hex chars
  if (/^0x[0-9A-Fa-f]+$/.test(trimmed) || (/^[0-9A-Fa-f]+$/.test(trimmed) && trimmed.length >= 2)) {
    return 16;
  }
  
  // Octal: starts with 0 and contains only 0-7
  if (/^0[0-7]+$/.test(trimmed)) {
    return 8;
  }
  
  // Decimal: contains only digits
  if (/^\d+$/.test(trimmed)) {
    return 10;
  }
  
  return null;
}

/**
 * Convert number from any base to decimal
 */
export function toDecimal(input: string, fromBase: NumberBase): number {
  const trimmed = input.trim().toLowerCase();
  const cleaned = trimmed.replace(/^0x/, ''); // Remove 0x prefix if present
  
  try {
    return parseInt(cleaned, fromBase);
  } catch {
    throw new Error(`Invalid ${fromBase}-base number: ${input}`);
  }
}

/**
 * Convert decimal to any base
 */
export function fromDecimal(decimal: number, toBase: NumberBase): string {
  if (decimal < 0) {
    throw new Error('Cannot convert negative numbers');
  }
  
  if (decimal === 0) return '0';
  
  const result = decimal.toString(toBase);
  
  if (toBase === 16) {
    return result.toUpperCase();
  }
  
  return result;
}

/**
 * Perform base conversion - convert from one base to all others
 */
export function convertNumberToAllBases(input: string, fromBase: NumberBase): BaseConversionResult {
  if (!input.trim()) {
    throw new Error('Input cannot be empty');
  }
  
  const decimal = toDecimal(input, fromBase);
  
  return {
    binary: fromDecimal(decimal, 2),
    octal: fromDecimal(decimal, 8),
    decimal: fromDecimal(decimal, 10),
    hex: fromDecimal(decimal, 16),
  };
}

/**
 * Get bit positions for binary explanation
 */
export function getBitExplanations(binaryString: string): BitExplanation[] {
  const bits = binaryString.padStart(8, '0'); // Pad to byte
  const explanations: BitExplanation[] = [];
  
  for (let i = 0; i < bits.length; i++) {
    const position = bits.length - 1 - i;
    const power = position;
    const isSet = bits[i] === '1';
    const decimal = isSet ? Math.pow(2, power) : 0;
    
    explanations.push({
      position,
      power,
      binary: bits[i],
      decimal,
      isSet,
    });
  }
  
  return explanations;
}

/**
 * Group binary into bytes (8-bit chunks)
 */
export function getByteGroups(binaryString: string): ByteGroup[] {
  // Pad to multiple of 8
  const padded = binaryString.padStart(Math.ceil(binaryString.length / 8) * 8, '0');
  const groups: ByteGroup[] = [];
  
  for (let i = 0; i < padded.length; i += 8) {
    const byte = padded.slice(i, i + 8);
    const decimal = parseInt(byte, 2);
    const hex = decimal.toString(16).toUpperCase().padStart(2, '0');
    
    groups.push({
      byte,
      decimal,
      hex,
    });
  }
  
  return groups;
}

/**
 * Simple Base32 encode
 */
export function encodeBase32(text: string): string {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    bits += text.charCodeAt(i).toString(2).padStart(8, '0');
  }
  
  bits = bits.padEnd(Math.ceil(bits.length / 5) * 5, '0');
  
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5);
    result += base32Chars[parseInt(chunk, 2)];
  }
  
  return result;
}

/**
 * Simple Base32 decode
 */
export function decodeBase32(encoded: string): string {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i].toUpperCase();
    const index = base32Chars.indexOf(char);
    if (index === -1) throw new Error(`Invalid Base32 character: ${char}`);
    bits += index.toString(2).padStart(5, '0');
  }
  
  let result = '';
  for (let i = 0; i < bits.length - 7; i += 8) {
    const byte = bits.slice(i, i + 8);
    result += String.fromCharCode(parseInt(byte, 2));
  }
  
  return result;
}

/**
 * Simple Base58 encode (Bitcoin-style)
 * Simplified implementation without BigInt for ES2017 compatibility
 */
export function encodeBase58(text: string): string {
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  // Convert text to decimal number array
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i));
  }
  
  // Convert byte array to big number representation
  let decimal = 0;
  for (let i = 0; i < bytes.length; i++) {
    decimal = decimal * 256 + bytes[i];
  }
  
  if (decimal === 0) return base58Chars[0];
  
  let result = '';
  while (decimal > 0) {
    result = base58Chars[decimal % 58] + result;
    decimal = Math.floor(decimal / 58);
  }
  
  // Add leading 1s for leading null bytes
  for (let i = 0; i < text.length && text.charCodeAt(i) === 0; i++) {
    result = base58Chars[0] + result;
  }
  
  return result;
}

/**
 * Simple Base58 decode
 * Simplified implementation without BigInt for ES2017 compatibility
 */
export function decodeBase58(encoded: string): string {
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  let decimal = 0;
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i];
    const index = base58Chars.indexOf(char);
    if (index === -1) throw new Error(`Invalid Base58 character: ${char}`);
    decimal = decimal * 58 + index;
  }
  
  let result = '';
  while (decimal > 0) {
    result = String.fromCharCode(decimal % 256) + result;
    decimal = Math.floor(decimal / 256);
  }
  
  // Add leading null bytes
  for (let i = 0; i < encoded.length && encoded[i] === base58Chars[0]; i++) {
    result = String.fromCharCode(0) + result;
  }
  
  return result;
}

/**
 * Convert text to various text-based encodings
 */
export function convertTextToAllEncodings(text: string): TextConversionResult {
  try {
    return {
      base32: encodeBase32(text),
      base58: encodeBase58(text),
      base64: btoa(unescape(encodeURIComponent(text))),
      ascii: text.split('').map(c => c.charCodeAt(0)).join(' '),
      utf8: Buffer.from ? Buffer.from(text, 'utf8').toString('hex') : Array.from(text).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
    };
  } catch (e) {
    throw new Error(`Text conversion failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Decode text from various encodings
 */
export function decodeTextFromEncoding(encoded: string, encoding: TextEncoding): string {
  try {
    switch (encoding) {
      case 'base32':
        return decodeBase32(encoded);
      case 'base58':
        return decodeBase58(encoded);
      case 'base64':
        return decodeURIComponent(escape(atob(encoded)));
      case 'ascii':
        return encoded.split(' ').map(code => String.fromCharCode(parseInt(code, 10))).join('');
      case 'utf8':
        return encoded.split(' ').map(code => String.fromCharCode(parseInt(code, 16))).join('');
      default:
        throw new Error(`Unknown encoding: ${encoding}`);
    }
  } catch (e) {
    throw new Error(`Decoding failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Check if string is valid hex color
 */
export function isValidHexColor(input: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(input.trim());
}

/**
 * Get RGB from hex color
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

/**
 * Generate code snippets for conversion
 */
export function generateCodeSnippets(fromBase: NumberBase, toBase: NumberBase, value: string): CodeSnippet[] {
  const decimal = toDecimal(value, fromBase);
  const result = fromDecimal(decimal, toBase);
  
  return [
    {
      language: 'JavaScript',
      code: `const result = parseInt("${value}", ${fromBase}).toString(${toBase});\n// result: "${result}"`,
    },
    {
      language: 'Python',
      code: `result = int("${value}", ${fromBase})\nprint(f"{result:#${toBase === 16 ? 'x' : 'b'}}")\n# result: "${result}"`,
    },
    {
      language: 'Java',
      code: `String result = Integer.toString(Integer.parseInt("${value}", ${fromBase}), ${toBase});\n// result: "${result}"`,
    },
    {
      language: 'C++',
      code: `int decimal = stoi("${value}", nullptr, ${fromBase});\nstring result = bitset<${toBase === 2 ? 32 : 16}>(decimal).to_string();\n// result: "${result}"`,
    },
  ];
}

/**
 * Reverse conversion - from text/hex to readable
 */
export function reverseHexToText(hex: string): string {
  try {
    const cleaned = hex.replace(/\s/g, '').replace(/^0x/i, '');
    let result = '';
    
    for (let i = 0; i < cleaned.length; i += 2) {
      const byte = cleaned.slice(i, i + 2);
      const code = parseInt(byte, 16);
      result += String.fromCharCode(code);
    }
    
    return result;
  } catch {
    throw new Error('Invalid hex string');
  }
}

/**
 * Reverse conversion - from binary to text
 */
export function reverseBinaryToText(binary: string): string {
  try {
    const cleaned = binary.replace(/\s/g, '');
    let result = '';
    
    for (let i = 0; i < cleaned.length; i += 8) {
      const byte = cleaned.slice(i, i + 8);
      const code = parseInt(byte, 2);
      result += String.fromCharCode(code);
    }
    
    return result;
  } catch {
    throw new Error('Invalid binary string');
  }
}
