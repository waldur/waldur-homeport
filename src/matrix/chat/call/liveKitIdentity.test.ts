import { describe, expect, it } from 'vitest';

import { computeLiveKitIdentities } from './liveKitIdentity';

describe('computeLiveKitIdentities', () => {
  it('includes the legacy identity lk-jwt /sfu/get issues to Element Call', async () => {
    const ids = await computeLiveKitIdentities('@drawerb:localhost', 'DEV1');
    expect(ids[0]).toBe('@drawerb:localhost:DEV1');
  });

  it('includes the /get_token hashes for both member id forms', async () => {
    const ids = await computeLiveKitIdentities('@a:s', 'D');
    // sha256(JSON ["@a:s","D","@a:s:D"]) and sha256(JSON ["@a:s","D","D"]),
    // unpadded base64, as lk-jwt-service's legacy_livekit_identity_for.
    const hash = async (raw: string) => {
      const buf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(raw),
      );
      return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(
        /=+$/,
        '',
      );
    };
    expect(ids).toContain(await hash('["@a:s","D","@a:s:D"]'));
    expect(ids).toContain(await hash('["@a:s","D","D"]'));
  });

  it('returns nothing without a user or device', async () => {
    expect(await computeLiveKitIdentities('', 'D')).toEqual([]);
  });
});
