import { describe, it, expect } from 'vitest';

import { isGuid, url } from './validators';

describe('GUID validator', () => {
  it('returns undefined if GUID is valid', () => {
    expect(isGuid('c2bb9245-78cd-4bde-bb70-7b7649c30178')).toBeUndefined();
  });

  it('returns error message if GUID is invalid', () => {
    expect(isGuid('invalid-guid-string')).toBe('GUID is expected.');
  });
});

describe('URL validator', () => {
  describe('valid URLs', () => {
    it('accepts basic HTTP URLs', () => {
      expect(url('http://example.com')).toBeUndefined();
    });

    it('accepts HTTPS URLs', () => {
      expect(url('https://example.com')).toBeUndefined();
    });

    it('accepts URLs without protocol (assumes HTTPS)', () => {
      expect(url('example.com')).toBeUndefined();
      expect(url('www.example.com')).toBeUndefined();
    });

    it('accepts URLs with paths', () => {
      expect(url('https://example.com/path/to/resource')).toBeUndefined();
    });

    it('accepts URLs with query parameters', () => {
      expect(
        url('https://example.com?param1=value1&param2=value2'),
      ).toBeUndefined();
    });

    it('accepts URLs with fragments', () => {
      expect(url('https://example.com#section')).toBeUndefined();
    });

    it('accepts URLs with ports', () => {
      expect(url('https://example.com:8080')).toBeUndefined();
      expect(url('http://localhost:3000')).toBeUndefined();
    });

    it('accepts URLs with subdomains', () => {
      expect(url('https://subdomain.example.com')).toBeUndefined();
      expect(url('https://api.v2.example.com')).toBeUndefined();
    });

    it('accepts URLs with encoded characters', () => {
      expect(url('https://example.com/path%20with%20spaces')).toBeUndefined();
    });

    it('accepts complex URLs with multiple query parameters and encoded values', () => {
      const complexUrl =
        'https://opencloud.yourtsrs.cloud/files/spaces/personal/admin?fileId=3fb30657-85c8-4bdb-a4a8-c4173719f03f%2401ee783f-e711-49b9-8003-b421aaa3ae88%2101ee783f-e711-49b9-8003-b421aaa3ae88&items-per-page=100&files-spaces-generic-view-mode=resource-table&tiles-size=2';
      expect(url(complexUrl)).toBeUndefined();
    });

    it('accepts URLs with special characters in query parameters', () => {
      expect(
        url('https://example.com?key=value&special=!@#$%^&*()'),
      ).toBeUndefined();
    });

    it('accepts localhost URLs', () => {
      expect(url('http://localhost')).toBeUndefined();
      expect(url('http://127.0.0.1')).toBeUndefined();
      expect(url('localhost:8080')).toBeUndefined();
    });

    it('accepts URLs with authentication', () => {
      expect(url('https://user:pass@example.com')).toBeUndefined();
    });

    it('accepts internationalized domain names', () => {
      expect(url('https://例え.jp')).toBeUndefined();
      expect(url('https://münchen.de')).toBeUndefined();
    });
  });

  describe('invalid URLs', () => {
    it('returns error for empty value', () => {
      expect(url('')).toBeUndefined();
      expect(url(null)).toBeUndefined();
      expect(url(undefined)).toBeUndefined();
    });

    it('returns error for invalid URL format', () => {
      const errorMessage =
        'Please enter a valid URL (e.g., https://example.com)';

      expect(url('not a url')).toBe(errorMessage);
      expect(url('javascript:alert(1)')).toBe(errorMessage);
      expect(url('ftp://example.com')).toBe(errorMessage);
      expect(url('//example.com')).toBe(errorMessage);
      expect(url('http://')).toBe(errorMessage);
      expect(url('http://?')).toBe(errorMessage);
      expect(url('http://??')).toBe(errorMessage);
      expect(url('http://??/')).toBe(errorMessage);
      expect(url('http://#')).toBe(errorMessage);
      expect(url('http://##')).toBe(errorMessage);
      expect(url('http://##/')).toBe(errorMessage);
      expect(url('http:// shouldfail.com')).toBe(errorMessage);
      expect(url(':// should fail')).toBe(errorMessage);
    });

    it('returns error for dot-only hostnames', () => {
      const errorMessage =
        'Please enter a valid URL (e.g., https://example.com)';

      expect(url('http://.')).toBe(errorMessage);
      expect(url('http://..')).toBe(errorMessage);
      expect(url('http://../')).toBe(errorMessage);
    });

    it('returns error for XSS attempts', () => {
      const errorMessage =
        'Please enter a valid URL (e.g., https://example.com)';

      expect(url('<script>alert(1)</script>')).toBe(errorMessage);
      expect(url('javascript:void(0)')).toBe(errorMessage);
      expect(url('data:text/html,<script>alert(1)</script>')).toBe(
        errorMessage,
      );
    });
  });

  describe('performance', () => {
    it('validates complex URLs quickly', () => {
      const complexUrl =
        'https://opencloud.yourtsrs.cloud/files/spaces/personal/admin?fileId=3fb30657-85c8-4bdb-a4a8-c4173719f03f%2401ee783f-e711-49b9-8003-b421aaa3ae88%2101ee783f-e711-49b9-8003-b421aaa3ae88&items-per-page=100&files-spaces-generic-view-mode=resource-table&tiles-size=2&very-long-parameter=' +
        'a'.repeat(1000);

      const startTime = performance.now();
      url(complexUrl);
      const endTime = performance.now();

      // Should complete in less than 10ms even for very long URLs
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('handles many validations efficiently', () => {
      const testUrls = [
        'https://example.com',
        'http://test.com?param=' + 'x'.repeat(100),
        'https://subdomain.example.com/path/to/resource?query=value#fragment',
      ];

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        testUrls.forEach((testUrl) => url(testUrl));
      }
      const endTime = performance.now();

      // 3000 validations should complete in less than 500ms
      // URL constructor validation is still fast but not as fast as simple regex
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
