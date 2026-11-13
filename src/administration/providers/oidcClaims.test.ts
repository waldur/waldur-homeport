import { describe, expect, it } from 'vitest';

import {
  ID_TOKEN_PROTOCOL_CLAIMS,
  mapsEmailToUnverifiedClaim,
} from './oidcClaims';

describe('mapsEmailToUnverifiedClaim', () => {
  it.each([
    'preferred_username',
    'preferred_username email',
    'email  upn',
    'unique_name',
  ])('flags %j', (value) => {
    expect(mapsEmailToUnverifiedClaim(value)).toBe(true);
  });

  it.each([
    'email',
    'mail',
    'email mail',
    '',
    null,
    undefined,
    'preferred_username_x',
    ['preferred_username'],
  ])('does not flag %j', (value) => {
    expect(mapsEmailToUnverifiedClaim(value)).toBe(false);
  });
});

describe('ID_TOKEN_PROTOCOL_CLAIMS', () => {
  it('keeps the claims that describe how the user authenticated mappable', () => {
    expect(ID_TOKEN_PROTOCOL_CLAIMS.has('acr')).toBe(false);
    expect(ID_TOKEN_PROTOCOL_CLAIMS.has('amr')).toBe(false);
    expect(ID_TOKEN_PROTOCOL_CLAIMS.has('nonce')).toBe(true);
  });
});
