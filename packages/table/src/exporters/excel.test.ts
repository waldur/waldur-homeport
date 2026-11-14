import { describe, it, expect } from 'vitest';

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

  // XML 1.0 forbids most control characters outright, escaped or not, and
  // text pasted from Word or a PDF can carry them: one in any string made the
  // whole shared string table unreadable, so Excel dropped every text cell.
  describe('characters XML cannot carry', () => {
    const parses = (sharedStrings: SharedStrings) => {
      const doc = new DOMParser().parseFromString(
        sharedStrings.serialize(),
        'application/xml',
      );
      return doc.getElementsByTagName('parsererror').length === 0;
    };

    it('writes control characters as Excel escapes, keeping the XML valid', () => {
      const sharedStrings = new SharedStrings();
      sharedStrings.getIndex('Line one\u000bline two\u000cend\u0001');
      expect(sharedStrings.formatStrings()).toBe(
        '<si><t>Line one_x000B_line two_x000C_end_x0001_</t></si>',
      );
      expect(parses(sharedStrings)).toBe(true);
    });

    it('writes the non-characters U+FFFE and U+FFFF as escapes', () => {
      const sharedStrings = new SharedStrings();
      sharedStrings.getIndex('a\ufffeb\uffffc');
      expect(sharedStrings.formatStrings()).toBe(
        '<si><t>a_xFFFE_b_xFFFF_c</t></si>',
      );
      expect(parses(sharedStrings)).toBe(true);
    });

    it('replaces an unpaired surrogate, which has no UTF-8 encoding', () => {
      const sharedStrings = new SharedStrings();
      sharedStrings.getIndex('cut emoji \ud83d');
      expect(sharedStrings.formatStrings()).toBe(
        '<si><t>cut emoji \ufffd</t></si>',
      );
      expect(parses(sharedStrings)).toBe(true);
    });

    it('keeps whole emoji, accents and line breaks as they are', () => {
      const sharedStrings = new SharedStrings();
      sharedStrings.getIndex('Zoë 🚀\nsecond line\ttabbed');
      expect(sharedStrings.formatStrings()).toBe(
        '<si><t>Zoë 🚀\nsecond line\ttabbed</t></si>',
      );
    });

    it('escapes text that looks like an Excel escape, so it reads back as typed', () => {
      const sharedStrings = new SharedStrings();
      sharedStrings.getIndex('code_x0041_');
      expect(sharedStrings.formatStrings()).toBe(
        '<si><t>code_x005F_x0041_</t></si>',
      );
    });

    it('keeps leading and trailing spaces, which Excel otherwise trims', () => {
      const sharedStrings = new SharedStrings();
      sharedStrings.getIndex('  indented ');
      expect(sharedStrings.formatStrings()).toBe(
        '<si><t xml:space="preserve">  indented </t></si>',
      );
    });
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
