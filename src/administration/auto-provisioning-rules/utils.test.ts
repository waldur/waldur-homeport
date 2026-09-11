import { describe, expect, it } from 'vitest';

import { claimsToRows, rowsToClaims, validateUserClaims } from './utils';

describe('claims map <-> rows', () => {
  it('round-trips a claims map through rows', () => {
    const claims = { roles: ['acme-owner'], entitlements: ['urn:x:*'] };
    expect(rowsToClaims(claimsToRows(claims))).toEqual(claims);
  });

  it('drops half-filled rows rather than submitting them', () => {
    expect(
      rowsToClaims([
        { claim: 'roles', values: [] },
        { claim: '', values: ['orphan'] },
        { claim: 'unit', values: ['hpc'] },
      ]),
    ).toEqual({ unit: ['hpc'] });
  });

  it('trims the claim name', () => {
    expect(rowsToClaims([{ claim: '  roles  ', values: ['a'] }])).toEqual({
      roles: ['a'],
    });
  });

  it('accepts the string shape the control emits before it is touched', () => {
    expect(rowsToClaims([{ claim: 'roles', values: 'a, b' }])).toEqual({
      roles: ['a', 'b'],
    });
  });

  it('treats an absent map as no claims', () => {
    expect(claimsToRows(undefined)).toEqual([]);
    expect(rowsToClaims(undefined)).toEqual({});
  });
});

describe('validateUserClaims', () => {
  it('accepts no rows', () => {
    expect(validateUserClaims([])).toBeUndefined();
    expect(validateUserClaims(undefined)).toBeUndefined();
  });

  it('accepts a fully filled row', () => {
    expect(
      validateUserClaims([{ claim: 'roles', values: ['acme-owner'] }]),
    ).toBeUndefined();
  });

  it('ignores a row the user has added but not filled in', () => {
    expect(validateUserClaims([{ claim: '', values: [] }])).toBeUndefined();
  });

  it('rejects a claim with no accepted values', () => {
    expect(validateUserClaims([{ claim: 'roles', values: [] }])).toContain(
      'accepted value',
    );
  });

  it('rejects values with no claim name', () => {
    expect(validateUserClaims([{ claim: '', values: ['a'] }])).toContain(
      'claim name',
    );
  });

  it('rejects a bare star, which would match every value', () => {
    expect(validateUserClaims([{ claim: 'roles', values: ['*'] }])).toContain(
      'bare "*"',
    );
  });

  it('allows a prefix pattern', () => {
    expect(
      validateUserClaims([{ claim: 'entitlements', values: ['urn:x:hpc-*'] }]),
    ).toBeUndefined();
  });

  it('rejects the same claim listed twice', () => {
    // The API shape is a map, so two rows naming one claim would silently
    // collapse on submit and the first row's values would be lost.
    expect(
      validateUserClaims([
        { claim: 'roles', values: ['a'] },
        { claim: 'roles', values: ['b'] },
      ]),
    ).toContain('listed twice');
  });

  it('catches a duplicate that differs only by surrounding whitespace', () => {
    expect(
      validateUserClaims([
        { claim: 'roles', values: ['a'] },
        { claim: ' roles ', values: ['b'] },
      ]),
    ).toContain('listed twice');
  });
});
