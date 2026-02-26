import { describe, it, expect } from 'vitest';

import { formatUsageValue } from './formatNumber';

describe('formatUsageValue', () => {
  describe('standard formatting (thousands separators)', () => {
    it('formats large numbers with separators', () => {
      expect(formatUsageValue(1000)).toBe('1,000');
      expect(formatUsageValue(1000000)).toBe('1,000,000');
      expect(formatUsageValue(1234567890)).toBe('1,234,567,890');
    });

    it('does not add separators to small numbers', () => {
      expect(formatUsageValue(0)).toBe('0');
      expect(formatUsageValue(1)).toBe('1');
      expect(formatUsageValue(999)).toBe('999');
    });

    it('handles decimal numbers', () => {
      expect(formatUsageValue(1234.56)).toBe('1,234.56');
      expect(formatUsageValue(0.5)).toBe('0.5');
    });

    it('handles negative numbers', () => {
      expect(formatUsageValue(-1000)).toBe('-1,000');
      expect(formatUsageValue(-1234567)).toBe('-1,234,567');
    });
  });

  describe('compact formatting', () => {
    it('abbreviates thousands', () => {
      expect(formatUsageValue(1000, true)).toBe('1K');
      expect(formatUsageValue(1200, true)).toBe('1.2K');
      expect(formatUsageValue(15000, true)).toBe('15K');
    });

    it('abbreviates millions', () => {
      expect(formatUsageValue(1000000, true)).toBe('1M');
      expect(formatUsageValue(1200000, true)).toBe('1.2M');
      expect(formatUsageValue(25000000, true)).toBe('25M');
    });

    it('abbreviates billions', () => {
      expect(formatUsageValue(1000000000, true)).toBe('1B');
      expect(formatUsageValue(1500000000, true)).toBe('1.5B');
    });

    it('does not abbreviate small numbers', () => {
      expect(formatUsageValue(0, true)).toBe('0');
      expect(formatUsageValue(999, true)).toBe('999');
    });

    it('limits to 1 decimal place', () => {
      expect(formatUsageValue(1250, true)).toBe('1.3K');
      expect(formatUsageValue(1550000, true)).toBe('1.6M');
    });
  });

  describe('string input', () => {
    it('parses numeric strings', () => {
      expect(formatUsageValue('1000')).toBe('1,000');
      expect(formatUsageValue('1000000')).toBe('1,000,000');
    });

    it('parses decimal strings from toFixed()', () => {
      expect(formatUsageValue('1234.50')).toBe('1,234.5');
      expect(formatUsageValue('1000000.00')).toBe('1,000,000');
    });

    it('returns original string for non-numeric input', () => {
      expect(formatUsageValue('abc')).toBe('abc');
      expect(formatUsageValue('')).toBe('');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for null/undefined', () => {
      expect(formatUsageValue(null)).toBe('');
      expect(formatUsageValue(undefined)).toBe('');
    });

    it('handles zero', () => {
      expect(formatUsageValue(0)).toBe('0');
      expect(formatUsageValue(0, true)).toBe('0');
    });
  });
});
