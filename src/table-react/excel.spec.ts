import { SharedStrings, getSheetData } from './excel';

describe('Excel exporter', () => {
  it('serializes shared strings correctly', () => {
    const sharedStrings = new SharedStrings();
    expect(sharedStrings.getIndex('Hello')).toBe(0);
    expect(sharedStrings.getIndex('World')).toBe(1);
    expect(sharedStrings.formatStrings()).toBe(
      '<si><t>Hello</t></si><si><t>World</t></si>',
    );
  });

  it('escapes shared strings', () => {
    const sharedStrings = new SharedStrings();
    sharedStrings.getIndex('1>0');
    expect(sharedStrings.formatStrings()).toBe('<si><t>1&gt;0</t></si>');
  });

  it('serializes excel sheet correctly', () => {
    const rows = [
      ['Alice', 10],
      ['Bob', 20],
    ];
    const sharedStrings = new SharedStrings();
    const sheetData = getSheetData(sharedStrings, rows);
    const expectedRows =
      '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="n"><v>10</v></c></row>' +
      '<row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2" t="n"><v>20</v></c></row>';
    expect(sheetData).toBe(expectedRows);
  });
});
