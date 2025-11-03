/**
 * Export utilities for various formats
 */

export interface ExportFormat {
  id: string;
  name: string;
  ext: string;
  mimeType: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'json',
    name: 'JSON',
    ext: '.json',
    mimeType: 'application/json',
  },
  {
    id: 'js',
    name: 'JavaScript',
    ext: '.js',
    mimeType: 'text/javascript',
  },
  {
    id: 'ts',
    name: 'TypeScript',
    ext: '.ts',
    mimeType: 'text/typescript',
  },
  {
    id: 'sql',
    name: 'SQL',
    ext: '.sql',
    mimeType: 'text/sql',
  },
  {
    id: 'yaml',
    name: 'YAML',
    ext: '.yaml',
    mimeType: 'text/yaml',
  },
  {
    id: 'csv',
    name: 'CSV',
    ext: '.csv',
    mimeType: 'text/csv',
  },
];

export function downloadFile(
  content: string,
  fileName: string,
  mimeType: string = 'text/plain'
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
