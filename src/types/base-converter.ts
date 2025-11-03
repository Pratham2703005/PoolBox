/**
 * Base Converter Types and Interfaces
 */

export type NumberBase = 2 | 8 | 10 | 16;
export type TextEncoding = 'base32' | 'base58' | 'base64' | 'ascii' | 'utf8';
export type ConversionMode = 'number' | 'text';

export interface BaseConversionResult {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
}

export interface TextConversionResult {
  base32: string;
  base58: string;
  base64: string;
  ascii: string;
  utf8: string;
}

export interface BitPosition {
  power: number;
  value: number;
  isSet: boolean;
}

export interface ByteGroup {
  byte: string;
  decimal: number;
  hex: string;
}

export interface ConversionInput {
  value: string;
  base: NumberBase;
  mode: ConversionMode;
}

export interface ConversionState {
  input: string;
  base: NumberBase;
  mode: ConversionMode;
  numberResults: BaseConversionResult | null;
  textResults: TextConversionResult | null;
  detectedBase: NumberBase | null;
  error: string | null;
}

export interface BitExplanation {
  position: number;
  power: number;
  binary: string;
  decimal: number;
  isSet: boolean;
}

export interface CodeSnippet {
  language: string;
  code: string;
}
