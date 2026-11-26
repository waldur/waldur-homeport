import { describe, expect, it } from 'vitest';

import {
  describeSecretPolicy,
  formatSecretStatus,
  resolveSecretPolicy,
  validateSecretPolicy,
  validateSecretValue,
} from './secretOptions';

describe('resolveSecretPolicy', () => {
  it('fills the server defaults', () => {
    expect(resolveSecretPolicy(undefined)).toEqual({
      source: 'customer',
      customerSets: true,
      customerCanReveal: false,
      minLength: 1,
      maxLength: 4096,
      multiline: false,
    });
  });

  it('lets customers read back what the provider sets, unless told not to', () => {
    expect(
      resolveSecretPolicy({ secret_source: 'provider' }).customerCanReveal,
    ).toBe(true);
    expect(
      resolveSecretPolicy({
        secret_source: 'provider',
        customer_can_reveal: false,
      }).customerCanReveal,
    ).toBe(false);
  });

  it('caps the length', () => {
    expect(resolveSecretPolicy({ max_length: 100000 }).maxLength).toBe(65536);
  });
});

describe('validateSecretValue', () => {
  const policy = { min_length: 8, max_length: 12 };

  it('leaves an empty value to required', () => {
    expect(validateSecretValue(undefined, policy)).toBeUndefined();
    expect(validateSecretValue('', policy)).toBeUndefined();
  });

  it('checks the length in characters, not UTF-16 units', () => {
    expect(validateSecretValue('short', policy)).toBe(
      'Enter 8 to 12 characters.',
    );
    expect(validateSecretValue('far-too-long-value', policy)).toBe(
      'Enter 8 to 12 characters.',
    );
    // Eight emoji are eight characters, though sixteen UTF-16 units.
    expect(validateSecretValue('🔑'.repeat(8), policy)).toBeUndefined();
  });

  it('keeps a single-line secret to one line, without control characters', () => {
    const message =
      'The secret must be a single line, without control characters.';
    expect(validateSecretValue('line\nbreak', policy)).toBe(message);
    expect(validateSecretValue('with\ttab1', policy)).toBe(message);
    expect(validateSecretValue('bell\u0007abc', policy)).toBe(message);
    expect(validateSecretValue('good-key-1', policy)).toBeUndefined();
  });

  it('allows line breaks and tabs in a multi-line secret, nothing else', () => {
    const multiline = { multiline: true };
    expect(
      validateSecretValue('-----BEGIN-----\r\n\tabc\n-----END-----', multiline),
    ).toBeUndefined();
    expect(validateSecretValue('nul\u0000here', multiline)).toBe(
      'The secret may not hold control characters.',
    );
  });

  it('refuses a value for a secret the provider sets, unless the provider sends it', () => {
    const provided = { secret_source: 'provider' as const };
    expect(validateSecretValue('anything', provided)).toBe(
      'The provider sets this secret; leave it out.',
    );
    expect(
      validateSecretValue('anything', provided, { asProvider: true }),
    ).toBeUndefined();
  });

  it('never echoes the value', () => {
    expect(validateSecretValue('s3cr3t\n', policy)).not.toContain('s3cr3t');
  });
});

describe('describeSecretPolicy', () => {
  it('says what the policy accepts', () => {
    expect(describeSecretPolicy({ min_length: 8, max_length: 255 })).toBe(
      '8 to 255 characters, on one line.',
    );
    expect(describeSecretPolicy({ multiline: true })).toBe(
      '1 to 4096 characters; several lines are allowed.',
    );
  });
});

describe('formatSecretStatus', () => {
  it('says whether a secret is set', () => {
    expect(formatSecretStatus({ is_set: true })).toBe('Set');
    expect(formatSecretStatus({ is_set: false })).toBe('Not set');
    expect(formatSecretStatus(undefined)).toBe('Not set');
  });
});

describe('validateSecretPolicy', () => {
  it('accepts a sound policy and an empty one', () => {
    expect(
      validateSecretPolicy({ min_length: 8, max_length: 255 }),
    ).toBeUndefined();
    expect(validateSecretPolicy({})).toBeUndefined();
  });

  it('refuses lengths below 1', () => {
    expect(validateSecretPolicy({ min_length: 0 })).toEqual({
      min_length: 'Enter a whole number, 1 or more.',
    });
  });

  it('caps the longest length', () => {
    expect(validateSecretPolicy({ max_length: 70000 })).toEqual({
      max_length: 'Enter at most 65536.',
    });
  });

  it('refuses limits the wrong way round, defaults included', () => {
    expect(validateSecretPolicy({ min_length: 300, max_length: 255 })).toEqual({
      max_length: 'The longest length must not be lower than the shortest.',
    });
    expect(validateSecretPolicy({ min_length: 5000 })).toEqual({
      max_length: 'The longest length must not be lower than the shortest.',
    });
  });
});
