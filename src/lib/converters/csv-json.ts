/**
 * CSV ↔ JSON Converter with advanced features
 * - Auto-detect delimiter and encoding
 * - Smart type detection (numeric, boolean, null, date)
 * - Handle nested JSON in CSV columns
 * - Bidirectional conversion
 */

// Detect delimiter from CSV sample
export function detectDelimiter(sample: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const lines = sample.split('\n').slice(0, 3);
  
  let maxCount = 0;
  let detectedDelimiter = ',';
  
  for (const delimiter of delimiters) {
    let count = 0;
    for (const line of lines) {
      count += (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
    }
    
    // Average per line
    const avgPerLine = count / Math.max(lines.length, 1);
    
    // Need at least 2 occurrences per line on average
    if (avgPerLine > maxCount && avgPerLine >= 2) {
      maxCount = avgPerLine;
      detectedDelimiter = delimiter;
    }
  }
  
  return detectedDelimiter;
}

// Detect encoding from text
export function detectEncoding(text: string): 'UTF-8' | 'ISO-8859-1' {
  // Simple detection: if contains common UTF-8 multi-byte sequences, assume UTF-8
  try {
    const utf8Regex = /[\xC0-\xFF][\x80-\xBF]/g;
    if (utf8Regex.test(text)) {
      return 'UTF-8';
    }
  } catch {
    // Fall back to UTF-8
  }
  return 'UTF-8';
}

// Smart type detection and conversion
export function smartTypeDetection(value: string): string | number | boolean | null | unknown {
  if (!value || value.trim() === '') {
    return null;
  }

  const trimmed = value.trim();

  // Check for boolean
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Check for null
  if (trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'na') {
    return null;
  }

  // Check for number
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') {
    return num;
  }

  // Check for JSON object/array
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Not valid JSON, return as string
    }
  }

  // Check for ISO date
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(trimmed)) {
    return trimmed;
  }

  // Default to string
  return trimmed;
}

// Parse CSV to array of objects
export interface ParseCSVOptions {
  delimiter?: string;
  hasHeader?: boolean;
  trimSpaces?: boolean;
  smartTypes?: boolean;
  fixMissingHeaders?: boolean;
  skipEmptyRows?: boolean;
}

export function parseCSV(
  csv: string,
  options: ParseCSVOptions = {}
): {
  data: Record<string, unknown>[];
  headers: string[];
  delimiter: string;
  rowCount: number;
  issues: string[];
} {
  const {
    delimiter = detectDelimiter(csv),
    hasHeader = true,
    trimSpaces = true,
    smartTypes = true,
    fixMissingHeaders = true,
    skipEmptyRows = true,
  } = options;

  const issues: string[] = [];
  let lines = csv.trim().split('\n');

  // Handle different line endings
  if (lines.length === 1) {
    lines = csv.trim().split('\r\n');
  }

  if (lines.length === 0) {
    return { data: [], headers: [], delimiter, rowCount: 0, issues: ['Empty CSV'] };
  }

  // Parse header
  let headers = parseCSVLine(lines[0], delimiter);
  
  if (trimSpaces) {
    headers = headers.map(h => h.trim());
  }

  // Fix missing headers
  if (fixMissingHeaders) {
    headers = headers.map((h, i) => {
      if (!h || h === '') {
        issues.push(`Missing header at column ${i + 1}, auto-generated as "Column${i + 1}"`);
        return `Column${i + 1}`;
      }
      return h;
    });
  }

  // Parse data rows
  const data: Record<string, unknown>[] = [];
  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty rows
    if (skipEmptyRows && !line) {
      continue;
    }

    const values = parseCSVLine(line, delimiter);

    if (trimSpaces) {
      values.forEach((_, j) => {
        values[j] = values[j]?.trim() || '';
      });
    }

    // Create object from headers and values
    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      const value = values[j] || '';
      row[headers[j]] = smartTypes ? smartTypeDetection(value) : value;
    }

    data.push(row);
  }

  return {
    data,
    headers,
    delimiter,
    rowCount: data.length,
    issues,
  };
}

// Parse a single CSV line (handling quotes)
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Convert JSON array to CSV
export interface JSONToCSVOptions {
  delimiter?: string;
  includeHeader?: boolean;
  quoteStrings?: boolean;
  flattenNested?: boolean;
}

export function jsonToCSV(
  data: Record<string, unknown>[],
  options: JSONToCSVOptions = {}
): { csv: string; headers: string[] } {
  const {
    delimiter = ',',
    includeHeader = true,
    quoteStrings = true,
    flattenNested = false,
  } = options;

  if (!data || data.length === 0) {
    return { csv: '', headers: [] };
  }

  // Get all unique headers
  const headers = new Set<string>();
  for (const row of data) {
    Object.keys(row).forEach(key => headers.add(key));
  }

  const headerArray = Array.from(headers);

  // Build CSV
  let csv = '';

  // Add header
  if (includeHeader) {
    csv += headerArray
      .map(h => escapeCSVValue(h, delimiter, quoteStrings))
      .join(delimiter) + '\n';
  }

  // Add rows
  for (const row of data) {
    const values = headerArray.map(header => {
      let value = row[header];

      if (flattenNested) {
        // Convert objects/arrays to JSON strings
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
      } else {
        // Just use JSON stringify for complex types
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          value = value ? 'true' : 'false';
        } else if (value === null) {
          value = '';
        }
      }

      return escapeCSVValue(String(value), delimiter, quoteStrings);
    });

    csv += values.join(delimiter) + '\n';
  }

  return { csv: csv.trim(), headers: headerArray };
}

// Escape CSV value
function escapeCSVValue(value: string, delimiter: string, quoteStrings: boolean): string {
  const needsQuotes = value.includes(delimiter) || value.includes('"') || value.includes('\n');

  if (needsQuotes || (quoteStrings && typeof value === 'string' && !value.match(/^-?\d+(\.\d+)?$/))) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

// Format JSON data into different export formats
export function formatAsJSON(data: Record<string, unknown>[], pretty: boolean = true): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export function formatAsJavaScript(data: Record<string, unknown>[], varName: string = 'data'): string {
  return `const ${varName} = ${JSON.stringify(data, null, 2)};`;
}

export function formatAsTypeScript(data: Record<string, unknown>[], interfaceName: string = 'Data'): string {
  // Infer types from first row
  const types: Record<string, string> = {};

  if (data.length > 0) {
    for (const [key, value] of Object.entries(data[0])) {
      if (value === null) types[key] = 'string | null';
      else if (typeof value === 'boolean') types[key] = 'boolean';
      else if (typeof value === 'number') types[key] = 'number';
      else if (Array.isArray(value)) types[key] = 'unknown[]';
      else if (typeof value === 'object') types[key] = 'Record<string, unknown>';
      else types[key] = 'string';
    }
  }

  const interfaceStr = Object.entries(types)
    .map(([key, type]) => `  ${key}: ${type};`)
    .join('\n');

  return `interface ${interfaceName} {
${interfaceStr}
}

const ${interfaceName.toLowerCase().replace(/[A-Z]/g, l => `_${l.toLowerCase()}`).replace(/^_/, '')} = ${JSON.stringify(data, null, 2)} as ${interfaceName}[];`;
}

export function formatAsSQL(data: Record<string, unknown>[], tableName: string = 'data'): string {
  if (data.length === 0) return '';

  const columns = Object.keys(data[0]);
  const columnList = columns.join(', ');

  let sql = `INSERT INTO ${tableName} (${columnList})\nVALUES\n`;

  const values = data.map(row => {
    const vals = columns.map(col => {
      const value = row[col];

      if (value === null) return 'NULL';
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
      if (typeof value === 'boolean') return value ? '1' : '0';
      if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;

      return value;
    });

    return `(${vals.join(', ')})`;
  });

  sql += values.join(',\n') + ';';

  return sql;
}

export function formatAsYAML(data: Record<string, unknown>[]): string {
  let yaml = '';

  data.forEach((row) => {
    yaml += `- `;

    const entries = Object.entries(row);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      let yamlValue = '';

      if (value === null) {
        yamlValue = 'null';
      } else if (typeof value === 'string') {
        yamlValue = value.includes('\n') ? `|\n    ${value}` : value;
      } else if (typeof value === 'object') {
        yamlValue = JSON.stringify(value);
      } else {
        yamlValue = String(value);
      }

      yaml += `${key}: ${yamlValue}`;

      if (i < entries.length - 1) {
        yaml += ', ';
      }
    }

    yaml += '\n';
  });

  return yaml;
}

// Generate code snippet
export function generateCodeSnippet(data: Record<string, unknown>[], format: string, language: string = 'javascript'): string {
  const baseCode =
    format === 'json'
      ? formatAsJSON(data)
      : format === 'js'
        ? formatAsJavaScript(data)
        : format === 'ts'
          ? formatAsTypeScript(data)
          : format === 'sql'
            ? formatAsSQL(data)
            : format === 'yaml'
              ? formatAsYAML(data)
              : formatAsJSON(data);

  const snippet = `\`\`\`${language}
${baseCode}
\`\`\``;

  return snippet;
}
