import { describe, expect, it } from 'vitest';

import {
  htmlToPlainText,
  markdownToPlainText,
  parseMarkdown,
  parseMarkdownLinksOnly,
  sanitizeHtml,
} from './sanitize';

describe('htmlToPlainText', () => {
  it('returns an empty string for empty input', () => {
    expect(htmlToPlainText('')).toBe('');
  });

  it('keeps plain text as it is', () => {
    expect(htmlToPlainText('Training for SMEs')).toBe('Training for SMEs');
  });

  it('separates paragraphs and list items', () => {
    expect(
      htmlToPlainText(
        '<p>Training activities for:</p><ul><li>Industrial User</li><li>SME User</li></ul>',
      ),
    ).toBe('Training activities for: Industrial User SME User');
  });

  it('separates lines split by a break', () => {
    expect(htmlToPlainText('Industrial User<br>SME User<br/>')).toBe(
      'Industrial User SME User',
    );
  });

  it('keeps inline formatting within a word run', () => {
    expect(htmlToPlainText('<p>Half <strong>day</strong>s</p>')).toBe(
      'Half days',
    );
  });

  it('drops the contents of script and style elements', () => {
    expect(
      htmlToPlainText('<p>Intro</p><script>var x=1</script><style>p{}</style>'),
    ).toBe('Intro');
  });

  it('decodes entities', () => {
    expect(htmlToPlainText('<p>R&amp;D &lt;GPU&gt;</p>')).toBe('R&D <GPU>');
  });
});

describe('markdownToPlainText', () => {
  it('returns an empty string for empty input', () => {
    expect(markdownToPlainText('')).toBe('');
  });

  it('drops emphasis and list markers', () => {
    expect(
      markdownToPlainText(
        '**Description**\n\nExpert consultation.\n\n**This service provides:**\n\n* Assessment\n* Selection',
      ),
    ).toBe(
      'Description Expert consultation. This service provides: Assessment Selection',
    );
  });

  it('still handles HTML descriptions', () => {
    expect(
      markdownToPlainText('<p>Training for:</p><ul><li>SME</li></ul>'),
    ).toBe('Training for: SME');
  });

  it('keeps email addresses and decodes entities', () => {
    expect(markdownToPlainText('Contact info@example.com for R&D')).toBe(
      'Contact info@example.com for R&D',
    );
  });

  it('does not throw on deeply nested markdown', () => {
    expect(typeof markdownToPlainText('>'.repeat(3000) + 'x')).toBe('string');
    expect(typeof markdownToPlainText('> - '.repeat(1000))).toBe('string');
  });
});

describe('parseMarkdown', () => {
  it('does not throw on deeply nested markdown', () => {
    expect(typeof parseMarkdown('>'.repeat(3000) + 'x')).toBe('string');
  });
});

describe('class attributes', () => {
  const overlay =
    '<a href="https://example.com/" class="fixed inset-0 z-[9999]">Sign in</a>';

  it('are removed from sanitized HTML', () => {
    expect(sanitizeHtml(overlay)).toBe(
      '<a href="https://example.com/">Sign in</a>',
    );
  });

  it('are removed from links-only markdown', () => {
    expect(parseMarkdownLinksOnly(overlay)).not.toContain('class');
  });

  it('are removed from code blocks rendered from markdown', () => {
    const html = parseMarkdown('```js\nlet x;\n```');
    expect(html).not.toContain('class');
    expect(html).toContain('<pre><code>let x;');
  });
});
