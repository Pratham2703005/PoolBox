export type FieldType = 'string' | 'number' | 'boolean';

export type StringType = 
  | 'text'
  | 'sentence'
  | 'paragraph'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'address'
  | 'city'
  | 'state'
  | 'grade'
  | 'gender'
  | 'password';

export type OutputFormat = 'json' | 'csv' | 'sql';

export interface Field {
  id: number;
  name: string;
  type: FieldType;
  stringType: StringType;
  minWords: number;
  maxWords: number;
  min: number;
  max: number;
  decimals: number;
  startsWith: string;
  endsWith: string;
  emailDomain: string;
  passwordAlphabets: number;
  passwordNumbers: number;
  passwordSymbols: number;
}

export interface TemplateField {
  name: string;
  type: FieldType;
  stringType?: StringType;
  minWords?: number;
  maxWords?: number;
  min?: number;
  max?: number;
  decimals?: number;
  startsWith?: string;
  endsWith?: string;
  emailDomain?: string;
  passwordAlphabets?: number;
  passwordNumbers?: number;
  passwordSymbols?: number;
}

export interface Template {
  name: string;
  fields: TemplateField[];
}

export interface GenerateDataRequest {
  fields: Field[];
  count: number;
  format: OutputFormat;
}

export interface GenerateDataResponse {
  data?: string | Record<string, unknown>[] | Record<string, unknown>;
  error?: string;
}
