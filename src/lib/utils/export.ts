function ensureExtension(filename: string, extension: '.csv' | '.json'): string {
  return filename.toLowerCase().endsWith(extension) ? filename : `${filename}${extension}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: unknown): string {
  if (value == null) return '';
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function exportToCSV(rows: Record<string, unknown>[], filename: string): void {
  const safeFilename = ensureExtension(filename, '.csv');
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const lines: string[] = [];

  if (headers.length > 0) {
    lines.push(headers.join(','));
    for (const row of rows) {
      lines.push(headers.map((header) => escapeCsv(row[header])).join(','));
    }
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, safeFilename);
}

export function exportToJSON(data: unknown, filename: string): void {
  const safeFilename = ensureExtension(filename, '.json');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  triggerDownload(blob, safeFilename);
}
