// Lightweight prettifier helpers: detect and format a few common formats.
// Keep this dependency-free and safe for client-side use.

export type DetectedFormat = 'json' | 'xml' | 'html' | 'css' | 'csv' | 'unknown';

export function detectFormat(input: string): DetectedFormat {
  const trimmed = input.trim();
  if (!trimmed) return 'unknown';

  // JSON: starts with { or [ and parses
  if (/^[\[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // fallthrough
    }
  }

  // XML or HTML: starts with <
  if (trimmed.startsWith('<')) {
    // XML declaration or common html tags
    if (/^<\?xml\b/i.test(trimmed) || /^<!DOCTYPE\b/i.test(trimmed)) return 'xml';
    // Most HTML docs have <html> or tags — we'll call them html
    if (/^<html\b|<\w+/i.test(trimmed)) return /<\w+/.test(trimmed) ? 'html' : 'xml';
  }

  // CSV: lines with commas/semicolons and consistent column counts
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  if (lines.length > 0 && lines.every(l => l.includes(',') || l.includes(';'))) {
    // simple heuristic: header line and consistent counts
    const counts = lines.map(l => l.split(/,|;/).length);
    const uniq = new Set(counts);
    if (uniq.size === 1 || counts[0] > 1) return 'csv';
  }

  // CSS: contains selectors and braces
  if (/[\w\.#][^{]+\{[^}]*\}/.test(trimmed)) return 'css';

  return 'unknown';
}

export function prettify(input: string, format: DetectedFormat, indent = 2): string {
  if (!input) return '';
  try {
    if (format === 'json') {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, indent);
    }
  } catch {
    // If JSON parse fails, fall through to return original
  }

  if (format === 'xml' || format === 'html') {
    return formatXmlHtml(input, indent);
  }

  if (format === 'css') {
    return formatCss(input, indent);
  }

  if (format === 'csv') {
    return formatCsv(input);
  }

  // unknown: return trimmed
  return input.trim();
}

function formatXmlHtml(input: string, indent = 2) {
  // Use DOMParser if available (browser). If not, do a simple indent.
  try {
    // DOMParser exists in browsers; Next.js pages using this lib run client-side.
    // We use it if available to canonicalize the markup then pretty-print.
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      // Try parsing as 'text/html' first
      let doc = parser.parseFromString(input, 'text/html');
      // If parser produced a document with only a text node and the input looks like XML, try xml parsing
      const hasElements = doc.body && doc.body.children && doc.body.children.length > 0;
      if (!hasElements) {
        // try xml
        doc = parser.parseFromString(input, 'application/xml');
      }

  const serialized = new XMLSerializer().serializeToString(doc);
      // Simple pretty print by inserting newlines around tags.
      return prettyIndentXml(serialized, indent);
    }
  } catch {
    // fallback
  }
  return prettyIndentXml(input, indent);
}

function prettyIndentXml(xml: string, indent = 2) {
  // Very small pretty-printer for XML/HTML strings.
  const PADDING = ' '.repeat(indent);
  const tokens = xml
    .replace(/>\s+</g, '><')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .split(/(?=<)|(?<=>)/)
    .filter(Boolean);

  let depth = 0;
  const out: string[] = [];
  for (const token of tokens) {
    if (/^<\//.test(token)) {
      depth = Math.max(0, depth - 1);
      out.push(PADDING.repeat(depth) + token);
    } else if (/^<[^!?][^>]*\/>$/.test(token)) {
      // self-closing
      out.push(PADDING.repeat(depth) + token);
    } else if (/^<\!|^<\?/.test(token)) {
      out.push(PADDING.repeat(depth) + token);
    } else if (/^</.test(token)) {
      out.push(PADDING.repeat(depth) + token);
      if (!/\/>$/.test(token) && !/^<\?/.test(token) && !/^<!/.test(token)) depth += 1;
    } else {
      // text node
      const t = token.trim();
      if (t) out.push(PADDING.repeat(depth) + t);
    }
  }
  return out.join('\n');
}

function formatCss(input: string, indent = 2) {
  // Very small CSS pretty printer: put rules on their own lines and indent declarations
  const spaces = ' '.repeat(indent);
  // Normalize braces
  const withoutNewlines = input.replace(/\s*{\s*/g, ' { ').replace(/\s*}\s*/g, ' } ').replace(/;\s*/g, '; ');
  const parts = withoutNewlines.split(/(\{|\})/g).map(p => p.trim()).filter(Boolean);
  const out: string[] = [];
  let depth = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === '{') {
      out.push(spaces.repeat(depth) + '{');
      depth += 1;
    } else if (p === '}') {
      depth = Math.max(0, depth - 1);
      out.push(spaces.repeat(depth) + '}');
    } else {
      // If next token is { then p is selector
      const next = parts[i + 1];
      if (next === '{') {
        out.push(spaces.repeat(depth) + p);
      } else {
        // declarations: split by ;
        const decls = p.split(';').map(d => d.trim()).filter(Boolean);
        for (const d of decls) {
          out.push(spaces.repeat(depth) + d + ';');
        }
      }
    }
  }
  return out.join('\n').replace(/\n\}/g, '\n}').trim();
}

function formatCsv(input: string) {
  // Normalize line endings and ensure consistent spacing. This is intentionally minimal.
  const lines = input.replace(/\r/g, '').split('\n');
  const parsed = lines.map(l => l.split(/,|;/).map(cell => cell.trim()));
  // compute column widths
  const widths: number[] = [];
  for (const row of parsed) {
    row.forEach((cell, i) => {
      widths[i] = Math.max(widths[i] || 0, cell.length);
    });
  }
  const out = parsed.map(row => row.map((cell, i) => cell.padEnd(widths[i])).join(' | ')).join('\n');
  return out;
}
