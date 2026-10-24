import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportPdf } from 'waldur-js-client';

import exportAsPdf from './pdf';
import { PDF_MAX_CELLS } from './pdfLimits';
import { saveFile } from './saveFile';

vi.mock('./saveFile', () => ({ saveFile: vi.fn() }));

describe('PDF exporter', () => {
  const pdf = new Blob(['%PDF-'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exportPdf).mockResolvedValue({ data: pdf } as any);
  });

  it('sends the rows as text and saves the PDF the server returns', async () => {
    await exportAsPdf('Resources', {
      fields: ['Name', 'Cores', 'Shared'],
      data: [
        ['vm-1', 4, true],
        ['vm-2', null as any],
      ],
    });

    expect(exportPdf).toHaveBeenCalledWith({
      body: {
        title: 'Resources',
        columns: ['Name', 'Cores', 'Shared'],
        // Short rows are padded, so every row has one cell per column.
        rows: [
          ['vm-1', '4', 'true'],
          ['vm-2', '', ''],
        ],
      },
    });
    expect(saveFile).toHaveBeenCalledWith(pdf, 'Resources.pdf');
  });

  it('keeps cells beyond the header under blank headings', async () => {
    await exportAsPdf('Usage', {
      fields: ['Month'],
      data: [['January', 10, 20]],
    });

    expect(exportPdf).toHaveBeenCalledWith({
      body: {
        title: 'Usage',
        columns: ['Month', '', ''],
        rows: [['January', '10', '20']],
      },
    });
  });

  it('refuses a table without columns', async () => {
    await expect(
      exportAsPdf('Empty', { fields: [], data: [] }),
    ).rejects.toThrow('no columns to export');
    expect(exportPdf).not.toHaveBeenCalled();
  });

  it('cuts a long title by character, never inside an emoji', async () => {
    const title = 'x'.repeat(254) + '🚀🚀';

    await exportAsPdf(title, { fields: ['A'], data: [] });

    expect(vi.mocked(exportPdf).mock.calls[0][0].body.title).toBe(
      'x'.repeat(254) + '🚀',
    );
  });

  it('refuses a table over the cell limit without calling the server', async () => {
    const columns = Array.from({ length: 10 }, (_, i) => `C${i}`);
    const rows = Array.from({ length: PDF_MAX_CELLS / 10 + 1 }, () =>
      columns.map(() => 'x'),
    );

    await expect(
      exportAsPdf('Big', { fields: columns, data: rows }),
    ).rejects.toThrow('Export it as CSV or Excel');
    expect(exportPdf).not.toHaveBeenCalled();
  });

  it('refuses a very long table before building it', async () => {
    const data = Array.from({ length: 130_000 }, () => ['x']);

    await expect(
      exportAsPdf('Long', { fields: ['Name'], data }),
    ).rejects.toThrow('a PDF holds at most 10,000 rows');
    expect(exportPdf).not.toHaveBeenCalled();
  });

  it('counts an emoji as one character, as the server does', async () => {
    // 600,000 emoji: 1,200,000 UTF-16 units, but within the 1,000,000 limit.
    await exportAsPdf('Emoji', {
      fields: ['Text'],
      data: [['🚀'.repeat(300_000)], ['🚀'.repeat(300_000)]],
    });

    expect(exportPdf).toHaveBeenCalled();
  });

  it('refuses a table over the text limit without calling the server', async () => {
    await expect(
      exportAsPdf('Long', {
        fields: ['Text'],
        data: [['x'.repeat(1_000_001)]],
      }),
    ).rejects.toThrow('characters of text');
    expect(exportPdf).not.toHaveBeenCalled();
  });
});
