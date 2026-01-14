import { describe, it, expect } from 'vitest';

import { email, isGuid, url, validateRedirectURLs } from './validators';

describe('GUID validator', () => {
  it('returns undefined if GUID is valid', () => {
    expect(isGuid('c2bb9245-78cd-4bde-bb70-7b7649c30178')).toBeUndefined();
  });

  it('returns error message if GUID is invalid', () => {
    expect(isGuid('invalid-guid-string')).toBe('GUID is expected.');
  });
});

describe('email validator', () => {
  describe('valid emails', () => {
    it('accepts standard email formats', () => {
      expect(email('test@example.com')).toBeUndefined();
      expect(email('user@domain.org')).toBeUndefined();
      expect(email('admin@site.net')).toBeUndefined();
    });

    it('accepts emails with modern long TLDs', () => {
      expect(email('user@immune.engineering')).toBeUndefined();
      expect(email('admin@site.technology')).toBeUndefined();
      expect(email('contact@company.international')).toBeUndefined();
      expect(email('info@studio.photography')).toBeUndefined();
    });

    it('accepts emails with numbers and special characters', () => {
      expect(email('user123@example.com')).toBeUndefined();
      expect(email('test.email@domain.co.uk')).toBeUndefined();
      expect(email('user+tag@example.org')).toBeUndefined();
      expect(email('user_name@domain-name.com')).toBeUndefined();
      expect(email('user%test@example.com')).toBeUndefined();
    });

    it('accepts emails with subdomains', () => {
      expect(email('user@mail.example.com')).toBeUndefined();
      expect(email('admin@api.v2.service.com')).toBeUndefined();
    });

    it('accepts emails with minimum valid TLD length', () => {
      expect(email('user@example.co')).toBeUndefined();
      expect(email('test@site.uk')).toBeUndefined();
    });
  });

  describe('invalid emails', () => {
    it('returns undefined for empty values', () => {
      expect(email('')).toBeUndefined();
      expect(email(null)).toBeUndefined();
      expect(email(undefined)).toBeUndefined();
    });

    it('returns error for invalid email formats', () => {
      const errorMessage = 'Invalid email address';

      expect(email('invalid')).toBe(errorMessage);
      expect(email('invalid@')).toBe(errorMessage);
      expect(email('@domain.com')).toBe(errorMessage);
      expect(email('user@')).toBe(errorMessage);
      expect(email('user@domain')).toBe(errorMessage);
      expect(email('user@domain.')).toBe(errorMessage);
      expect(email('user@.com')).toBe(errorMessage);
      expect(email('user @domain.com')).toBe(errorMessage);
      expect(email('user@domain .com')).toBe(errorMessage);
    });

    it('returns error for emails with single character TLD', () => {
      const errorMessage = 'Invalid email address';
      expect(email('user@domain.c')).toBe(errorMessage);
    });

    it('returns error for emails with invalid characters', () => {
      const errorMessage = 'Invalid email address';
      expect(email('user@domain.c<>m')).toBe(errorMessage);
      expect(email('user[]@domain.com')).toBe(errorMessage);
      expect(email('user@domain.com.')).toBe(errorMessage);
    });
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

      // Should complete in less than 15ms even for very long URLs
      expect(endTime - startTime).toBeLessThan(15);
    });

    it('handles many validations efficiently', () => {
      const testUrls = [
        'https://example.com',
        'http://test.com?param=' + 'x'.repeat(100),
        'https://subdomain.example.com/path/to/resource?query=value#fragment',
      ];

      const startTime = performance.now();
      for (let i = 0; i < 1500; i++) {
        testUrls.forEach((testUrl) => url(testUrl));
      }
      const endTime = performance.now();

      // 3000 validations should complete in less than 1500ms
      // URL constructor validation is still fast but not as fast as simple regex
      expect(endTime - startTime).toBeLessThan(1500);
    });
  });
});

describe('validateRedirectURLs', () => {
  describe('empty values', () => {
    it('allows null', () => {
      expect(validateRedirectURLs(null)).toBeUndefined();
    });

    it('allows undefined', () => {
      expect(validateRedirectURLs(undefined)).toBeUndefined();
    });

    it('allows empty string', () => {
      expect(validateRedirectURLs('')).toBeUndefined();
    });

    it('allows empty array', () => {
      expect(validateRedirectURLs([])).toBeUndefined();
    });

    it('allows whitespace-only string', () => {
      expect(validateRedirectURLs('   ')).toBeUndefined();
    });
  });

  describe('valid single URL as string', () => {
    it('allows valid HTTPS URL', () => {
      expect(validateRedirectURLs('https://example.com')).toBeUndefined();
    });

    it('allows localhost with HTTP', () => {
      expect(validateRedirectURLs('http://localhost:8080')).toBeUndefined();
    });

    it('allows 127.0.0.1 with HTTP', () => {
      expect(validateRedirectURLs('http://127.0.0.1:3000')).toBeUndefined();
    });

    it('allows HTTPS URL with port', () => {
      expect(validateRedirectURLs('https://example.com:8443')).toBeUndefined();
    });

    it('trims whitespace from single URL string', () => {
      expect(validateRedirectURLs('  https://example.com  ')).toBeUndefined();
    });
  });

  describe('valid array of URLs', () => {
    it('allows array with one valid HTTPS URL', () => {
      expect(validateRedirectURLs(['https://example.com'])).toBeUndefined();
    });

    it('allows array with multiple valid URLs', () => {
      expect(
        validateRedirectURLs([
          'https://example.com',
          'https://another.com',
          'http://localhost:8080',
        ]),
      ).toBeUndefined();
    });

    it('allows array with URLs with ports', () => {
      expect(
        validateRedirectURLs([
          'https://example.com:8443',
          'http://localhost:3000',
        ]),
      ).toBeUndefined();
    });
  });

  describe('invalid single URL as string', () => {
    it('rejects HTTP URL for non-localhost domain', () => {
      const result = validateRedirectURLs('http://example.com');
      expect(result).toContain('URL 1:');
      expect(result).toContain('Must use HTTPS (unless localhost)');
    });

    it('rejects URL with trailing slash', () => {
      const result = validateRedirectURLs('https://example.com/');
      expect(result).toContain('URL 1:');
      expect(result).toContain('No trailing slashes allowed');
    });

    it('rejects URL with path', () => {
      const result = validateRedirectURLs('https://example.com/path');
      expect(result).toContain('URL 1:');
      expect(result).toContain(
        'Must be origin-only (no paths, query, or fragments)',
      );
    });

    it('rejects URL with query parameters', () => {
      const result = validateRedirectURLs('https://example.com?foo=bar');
      expect(result).toContain('URL 1:');
      expect(result).toContain(
        'Must be origin-only (no paths, query, or fragments)',
      );
    });

    it('rejects URL with fragment', () => {
      const result = validateRedirectURLs('https://example.com#section');
      expect(result).toContain('URL 1:');
      expect(result).toContain(
        'Must be origin-only (no paths, query, or fragments)',
      );
    });

    it('rejects URL without protocol', () => {
      const result = validateRedirectURLs('example.com');
      expect(result).toContain('URL 1:');
      expect(result).toContain('Missing http:// or https://');
    });

    it('rejects invalid URL format', () => {
      const result = validateRedirectURLs('not-a-url');
      expect(result).toContain('URL 1:');
      expect(result).toContain('Missing http:// or https://');
    });
  });

  describe('invalid array of URLs', () => {
    it('reports error with index for single invalid URL in array', () => {
      const result = validateRedirectURLs(['http://example.com']);
      expect(result).toContain('URL 1:');
      expect(result).toContain('Must use HTTPS (unless localhost)');
    });

    it('reports multiple errors with indices', () => {
      const result = validateRedirectURLs([
        'http://example.com',
        'https://another.com/',
        'invalid-url',
      ]);
      expect(result).toContain('URL 1:');
      expect(result).toContain('Must use HTTPS (unless localhost)');
      expect(result).toContain('URL 2:');
      expect(result).toContain('No trailing slashes allowed');
      expect(result).toContain('URL 3:');
      expect(result).toContain('Missing http:// or https://');
    });

    it('separates multiple errors with semicolons', () => {
      const result = validateRedirectURLs([
        'http://example.com',
        'https://another.com/',
      ]);
      expect(result).toMatch(/;/);
    });

    it('validates only the first URL for mixed array with valid URLs before invalid', () => {
      const result = validateRedirectURLs([
        'https://valid.com',
        'http://invalid.com',
      ]);
      expect(result).toContain('URL 2:');
      expect(result).toContain('Must use HTTPS (unless localhost)');
      expect(result).not.toContain('URL 1:');
    });
  });

  describe('edge cases', () => {
    it('allows array containing empty strings', () => {
      // Empty strings in array are validated individually by redirectURI which allows empty
      expect(validateRedirectURLs(['', '', ''])).toBeUndefined();
    });

    it('handles array with mix of valid and empty strings', () => {
      expect(
        validateRedirectURLs([
          'https://example.com',
          '',
          'https://another.com',
        ]),
      ).toBeUndefined();
    });

    it('handles array with whitespace-only strings', () => {
      expect(validateRedirectURLs(['   ', '  '])).toBeUndefined();
    });

    it('validates trimmed URLs in array', () => {
      expect(
        validateRedirectURLs([
          '  https://example.com  ',
          'https://another.com',
        ]),
      ).toBeUndefined();
    });

    it('reports error for invalid URL even with surrounding whitespace', () => {
      const result = validateRedirectURLs(['  http://example.com  ']);
      expect(result).toContain('URL 1:');
      expect(result).toContain('Must use HTTPS (unless localhost)');
    });
  });
});
