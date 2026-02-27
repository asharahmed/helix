import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportToCSV, exportToJSON } from '@/lib/utils/export';

describe('export utilities', () => {
  const createObjectURL = vi.fn((_: Blob) => 'blob:test');
  const revokeObjectURL = vi.fn();
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });
  });

  it('exports CSV with escaped values', async () => {
    exportToCSV(
      [
        { severity: 'critical', title: 'Disk "full"', description: 'path, /var' },
        { severity: 'warning', title: 'CPU', description: 'line 1\nline 2' },
      ],
      'alerts'
    );

    const blob = createObjectURL.mock.calls[0]?.[0] as unknown as Blob;
    const content = await blob.text();
    const link = document.querySelector('a[download="alerts.csv"]');

    expect(content).toContain('severity,title,description');
    expect(content).toContain('"Disk ""full"""');
    expect(content).toContain('"path, /var"');
    expect(content).toContain('"line 1\nline 2"');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    expect(link).toBeNull();
  });

  it('exports formatted JSON', async () => {
    exportToJSON({ count: 2, status: 'ok' }, 'events');

    const blob = createObjectURL.mock.calls[0]?.[0] as unknown as Blob;
    const content = await blob.text();

    expect(content).toBe(JSON.stringify({ count: 2, status: 'ok' }, null, 2));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
