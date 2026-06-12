import { describe, it, expect } from 'vitest';

import { getUrl, formatJiraMarkup } from './utils';

describe('Issue Comments Utils', () => {
  describe('getUrl', () => {
    it('extracts http URLs', () => {
      expect(getUrl('Check http://example.com for info')).toBe(
        'http://example.com',
      );
    });

    it('extracts https URLs', () => {
      expect(getUrl('Visit https://example.com/path?query=1')).toBe(
        'https://example.com/path?query=1',
      );
    });

    it('extracts www URLs', () => {
      expect(getUrl('Go to www.example.com')).toBe('www.example.com');
    });

    it('returns null for non-URLs', () => {
      expect(getUrl('No URL here')).toBeNull();
    });

    it('handles URLs with special characters efficiently', () => {
      const complexUrl =
        'https://example.com/path?param1=value1&param2=value2#section';
      expect(getUrl(`Check ${complexUrl} for details`)).toBe(complexUrl);
    });

    it('stops at square brackets for JIRA notation', () => {
      expect(getUrl('[Link|https://example.com]')).toBe('https://example.com');
      expect(getUrl('[https://example.com]')).toBe('https://example.com');
    });

    it('stops at pipe character for JIRA notation', () => {
      expect(getUrl('Link|https://example.com')).toBe('https://example.com');
    });

    it('handles URLs with encoded characters', () => {
      const encodedUrl =
        'https://example.com/path%20with%20spaces?key=value%26encoded';
      expect(getUrl(`URL: ${encodedUrl}`)).toBe(encodedUrl);
    });
  });

  describe('getUrl performance', () => {
    it('handles complex URLs without freezing', () => {
      const complexUrl =
        'https://opencloud.yourtsrs.cloud/files/spaces/personal/admin?fileId=3fb30657-85c8-4bdb-a4a8-c4173719f03f%2401ee783f-e711-49b9-8003-b421aaa3ae88%2101ee783f-e711-49b9-8003-b421aaa3ae88&items-per-page=100&files-spaces-generic-view-mode=resource-table&tiles-size=2';

      const startTime = performance.now();
      const result = getUrl(`Check this URL: ${complexUrl}`);
      const endTime = performance.now();

      expect(result).toBe(complexUrl);
      expect(endTime - startTime).toBeLessThan(10); // Should complete in less than 10ms
    });

    it('handles malformed input efficiently', () => {
      const maliciousInput =
        'http://' + 'a'.repeat(10000) + '!@#$%^&*()_+[]{}|;:,.<>?';

      const startTime = performance.now();
      getUrl(maliciousInput);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should not cause catastrophic backtracking
    });

    it('processes many URLs efficiently', () => {
      const testStrings = [
        'Visit https://example.com for more info',
        'Check www.test.com/path?query=value#hash',
        'Go to http://localhost:3000/admin',
        'No URL in this string',
        '[Link|https://jira.example.com/browse/ISSUE-123]',
      ];

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        testStrings.forEach((str) => getUrl(str));
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 5000 operations should complete quickly
    });
  });

  describe('formatJiraMarkup', () => {
    it('makes text bold with asterisks', () => {
      const input = 'This is *bold text* here';
      const output = formatJiraMarkup(input);
      expect(output).toContain('<b>bold text</b>');
    });

    it('makes text italic with underscores', () => {
      const input = 'This is _italic text_ here';
      const output = formatJiraMarkup(input);
      expect(output).toContain('<i>italic text</i>');
    });

    it('makes text monospaced with double curly braces', () => {
      const input = 'This is {{monospaced code}} here';
      const output = formatJiraMarkup(input);
      expect(output).toContain('<code>monospaced code</code>');
    });

    it('converts standalone links to HTML', () => {
      const input = 'Check this https://example.com for details';
      const output = formatJiraMarkup(input);
      expect(output).toContain(
        '<a href="https://example.com">https://example.com</a>',
      );
    });

    it('converts named links to HTML', () => {
      const input = '[Example Site|https://example.com]';
      const output = formatJiraMarkup(input);
      expect(output).toContain(
        '<a href="https://example.com">Example Site</a>',
      );
    });

    it('converts unnamed links to HTML', () => {
      const input = '[https://example.com]';
      const output = formatJiraMarkup(input);
      expect(output).toContain(
        '<a href="https://example.com">https://example.com</a>',
      );
    });

    it('handles complex URLs in JIRA notation', () => {
      const complexUrl =
        'https://example.com/path?param1=value1&param2=value2#section';
      const input = `[Click here|${complexUrl}]`;
      const output = formatJiraMarkup(input);
      expect(output).toContain(`<a href="${complexUrl}">Click here</a>`);
    });

    it('converts newlines to <br/> tags', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      const output = formatJiraMarkup(input);
      expect(output).toContain('Line 1<br/>Line 2<br/>Line 3');
    });

    it('handles images with thumbnail notation', () => {
      const input = '!image.png|thumbnail!';
      const attachments = [
        { file_name: 'image.png', file: '/path/to/image.png' },
      ] as any;
      const output = formatJiraMarkup(input, attachments);
      expect(output).toContain(
        '<img src="/path/to/image.png" title="image.png" />',
      );
    });

    it('shows error for missing attachments', () => {
      const input = '!missing.png|thumbnail!';
      const output = formatJiraMarkup(input, []);
      expect(output).toContain('Unable to find:');
      expect(output).toContain('missing.png');
    });

    it('handles file attachments in links', () => {
      const input = '[Download|document.pdf]';
      const attachments = [
        { file_name: 'document.pdf', file: '/path/to/document.pdf' },
      ] as any;
      const output = formatJiraMarkup(input, attachments);
      expect(output).toContain(
        '<a href="/path/to/document.pdf" download>Download</a>',
      );
    });

    it('escapes HTML to prevent XSS', () => {
      const input = '<script>alert(1)</script>';
      const output = formatJiraMarkup(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('&lt;script&gt;');
    });

    it('handles multiple formatting in one text', () => {
      const input =
        '*Bold* and _italic_ and {{code}} and https://example.com link';
      const output = formatJiraMarkup(input);
      expect(output).toContain('<b>Bold</b>');
      expect(output).toContain('<i>italic</i>');
      expect(output).toContain('<code>code</code>');
      expect(output).toContain(
        '<a href="https://example.com">https://example.com</a>',
      );
    });
  });
});
