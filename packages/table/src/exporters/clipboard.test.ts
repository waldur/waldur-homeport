import { describe, it, expect, vi, beforeEach } from 'vitest';

import exportToClipboard from './clipboard';

describe('exportToClipboard', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('converts data to CSV and writes to clipboard', async () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];

    await exportToClipboard(undefined, data);

    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    const writtenText = vi.mocked(navigator.clipboard.writeText).mock
      .calls[0][0];
    expect(writtenText).toContain('name');
    expect(writtenText).toContain('age');
    expect(writtenText).toContain('Alice');
    expect(writtenText).toContain('Bob');
  });

  it('escapes cells a spreadsheet would read as a formula', async () => {
    await exportToClipboard(undefined, {
      fields: ['name', 'amount'],
      data: [['=1+1', '-12.5']],
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `name,amount\r\n"'=1+1",-12.5`,
    );
  });

  it('returns a promise', () => {
    const result = exportToClipboard(undefined, [{ x: 1 }]);
    expect(result).toBeInstanceOf(Promise);
  });
});
