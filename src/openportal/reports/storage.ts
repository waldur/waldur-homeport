/**
 * Utility functions for storage size parsing and formatting,
 * or the special value "unlimited".
 */
import { translate } from '@waldur/i18n';

const BYTES_PER_UNIT: Record<string, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
  PB: 1024 ** 5,
};

const FORMAT_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

/**
 * Parse a human-readable storage size string to bytes.
 *   "unlimited"  → Infinity
 *   "24.00 KB"   → 24576
 *   "2.00 TB"    → 2199023255552
 *   unparseable  → 0
 */
export function parseStorageBytes(str: string): number {
  if (str.toLowerCase() === 'unlimited') return Infinity;
  const match = str.match(/^([\d.]+)\s*([A-Za-z]+)$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  return value * (BYTES_PER_UNIT[unit] ?? 1);
}

/** Format a byte count as a human-readable string e.g. "1.50 GB". */
export function formatStorageBytes(bytes: number): string {
  if (!isFinite(bytes)) return translate('Unlimited');
  if (bytes === 0) return translate('0 B');
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    FORMAT_UNITS.length - 1,
  );
  return translate('{value} {unit}', {
    value: (bytes / 1024 ** i).toFixed(2),
    unit: FORMAT_UNITS[i],
  });
}

/** Convert CPU-seconds to hours, rounded to 2 decimal places. */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100;
}
