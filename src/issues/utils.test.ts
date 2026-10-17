import { describe, expect, it } from 'vitest';

import { linkify, withLineBreaks } from './utils';

describe('linkify', () => {
  it('links each line of a text with line breaks', () => {
    expect(
      linkify(
        withLineBreaks(
          'Logs: [build log|https://ci.example/1]\nDocs: [guide|https://docs.example/x]',
        ),
      ),
    ).toBe(
      'Logs: <a href="https://ci.example/1">build log</a><br/>Docs: <a href="https://docs.example/x">guide</a>',
    );
  });
});

describe('withLineBreaks', () => {
  it('keeps the lines of plain text', () => {
    expect(withLineBreaks('Problem:\nIt fails.\r\n\r\nImpact: none')).toBe(
      'Problem:<br/>It fails.<br/><br/>Impact: none',
    );
  });

  it('leaves HTML to its own markup', () => {
    const html = '<p>Problem:</p>\n<p>It fails.</p>';
    expect(withLineBreaks(html)).toBe(html);
  });

  it('takes a comparison for text, not a tag', () => {
    expect(withLineBreaks('a < b\nc')).toBe('a < b<br/>c');
  });

  it('reads a missing text as empty', () => {
    expect(withLineBreaks(undefined)).toBe('');
  });
});
