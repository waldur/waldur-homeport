import { describe, expect, it } from 'vitest';

import { htmlToPlainText } from './sanitize';

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

  it('decodes entities', () => {
    expect(htmlToPlainText('<p>R&amp;D &lt;GPU&gt;</p>')).toBe('R&D <GPU>');
  });
});
