import { describe, expect, it } from 'vitest';

import { getOptionPatternValidator } from './optionPattern';
import {
  getOptionTransform,
  getOptionTransformValidator,
  transformOptionValue,
} from './optionTransform';

const transform = { prefix: 'acme-', suffix: '-prod', case: 'lower' as const };

describe('transformOptionValue', () => {
  it('applies prefix, suffix and case', () => {
    expect(transformOptionValue(transform, 'Backups')).toBe(
      'acme-backups-prod',
    );
  });

  it('gives the same value when applied twice, like mastermind', () => {
    const once = transformOptionValue(transform, 'Backups');
    expect(transformOptionValue(transform, once)).toBe(once);
  });

  it('keeps the case of the prefix and suffix', () => {
    expect(
      transformOptionValue({ prefix: 'Acme-', case: 'upper' }, 'logs'),
    ).toBe('Acme-LOGS');
  });

  it('matches the affixes ignoring case when a case is set, like mastermind', () => {
    expect(transformOptionValue(transform, 'ACME-Logs-PROD')).toBe(
      'acme-logs-prod',
    );
    expect(transformOptionValue({ prefix: 'acme-' }, 'ACME-logs')).toBe(
      'acme-ACME-logs',
    );
  });

  it('does not add a prefix the value already starts with', () => {
    expect(transformOptionValue({ prefix: 'acme-' }, 'acme-logs')).toBe(
      'acme-logs',
    );
  });
});

describe('getOptionTransform', () => {
  it('applies to string and text options only', () => {
    expect(getOptionTransform({ type: 'text', transform })).toBe(transform);
    expect(getOptionTransform({ type: 'integer', transform })).toBeUndefined();
  });

  it('ignores a transform with nothing set', () => {
    expect(
      getOptionTransform({ type: 'string', transform: { prefix: '' } }),
    ).toBeUndefined();
    expect(
      getOptionTransform({ type: 'string', transform: null }),
    ).toBeUndefined();
  });
});

describe('getOptionTransformValidator', () => {
  const validator = getOptionTransformValidator({ type: 'string', transform });

  it('rejects a value made only of the prefix and suffix', () => {
    expect(validator('acme-')).toBeDefined();
    expect(validator('acme--prod')).toBeDefined();
  });

  it('accepts a typed value and leaves empty values to required', () => {
    expect(validator('logs')).toBeUndefined();
    expect(validator('')).toBeUndefined();
    expect(validator(undefined)).toBeUndefined();
  });

  it('is not needed for a case-only transform', () => {
    expect(
      getOptionTransformValidator({
        type: 'string',
        transform: { case: 'lower' },
      }),
    ).toBeUndefined();
  });
});

describe('pattern with a transform', () => {
  const validator = getOptionPatternValidator({
    type: 'string',
    pattern: '[A-Za-z]+',
    transform,
  });

  it('is checked against the part the user typed', () => {
    expect(validator('Backups')).toBeUndefined();
    expect(validator('acme-Backups-prod')).toBeUndefined();
    expect(validator('back-ups')).toBeDefined();
  });
});
