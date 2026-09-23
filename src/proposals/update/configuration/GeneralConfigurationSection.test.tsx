import { describe, expect, it } from 'vitest';

import {
  formatOrderAuthorUser,
  normalizeOrderAuthorUser,
  validateFixedDuration,
} from './GeneralConfigurationSection';

describe('validateFixedDuration', () => {
  it('accepts an empty value, which clears the fixed duration', () => {
    expect(validateFixedDuration(null)).toBeUndefined();
    expect(validateFixedDuration('')).toBeUndefined();
    expect(validateFixedDuration(undefined)).toBeUndefined();
  });

  it('accepts a positive whole number, including the string form', () => {
    expect(validateFixedDuration(1)).toBeUndefined();
    expect(validateFixedDuration('45')).toBeUndefined();
  });

  it('rejects values the backend would refuse', () => {
    expect(validateFixedDuration(0)).toBeTruthy();
    expect(validateFixedDuration(-5)).toBeTruthy();
    expect(validateFixedDuration('1.5')).toBeTruthy();
    expect(validateFixedDuration('abc')).toBeTruthy();
  });
});

describe('formatOrderAuthorUser', () => {
  const call = { order_author_user_name: 'Grants Office' };

  it('turns the stored UUID into an option the picker can display', () => {
    expect(formatOrderAuthorUser('abc123', call)).toEqual({
      uuid: 'abc123',
      full_name: 'Grants Office',
    });
  });

  it('keeps a freshly picked user as it is', () => {
    const picked = { uuid: 'def456', full_name: 'Jane Doe' };
    expect(formatOrderAuthorUser(picked, call)).toBe(picked);
  });

  it('shows nothing selected when no contact is set', () => {
    expect(formatOrderAuthorUser(null, call)).toBeNull();
    expect(formatOrderAuthorUser('', call)).toBeNull();
    expect(formatOrderAuthorUser(undefined, call)).toBeNull();
  });
});

describe('normalizeOrderAuthorUser', () => {
  it('submits the UUID of a picked user', () => {
    expect(normalizeOrderAuthorUser({ uuid: 'def456' })).toBe('def456');
  });

  it('passes an unchanged UUID through', () => {
    expect(normalizeOrderAuthorUser('abc123')).toBe('abc123');
  });

  it('submits null for a cleared contact', () => {
    expect(normalizeOrderAuthorUser(null)).toBeNull();
    expect(normalizeOrderAuthorUser(undefined)).toBeNull();
  });
});
