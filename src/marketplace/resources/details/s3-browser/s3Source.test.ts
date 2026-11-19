import { describe, expect, it } from 'vitest';

import { baseName, prefixParts, refusedDeletes, usableKeys } from './s3Source';

describe('s3Source helpers', () => {
  it('splits a prefix into breadcrumb parts', () => {
    expect(prefixParts('')).toEqual([]);
    expect(prefixParts('logs/2026/')).toEqual(['logs', '2026']);
  });

  it('names a key or folder by its last segment', () => {
    expect(baseName('logs/2026/a.txt')).toBe('a.txt');
    expect(baseName('logs/2026/')).toBe('2026');
    expect(baseName('a.txt')).toBe('a.txt');
  });

  // The gateway answers 200 even when it refused keys (object lock, ACL).
  it('fails a delete the gateway partly refused', () => {
    expect(() =>
      refusedDeletes({
        deleted: 0,
        errors: [{ key: 'a', code: 'AccessDenied', detail: 'locked' }],
        remaining: false,
      }),
    ).toThrow('1 could not be deleted: locked');
  });

  it('fails a folder delete that left files behind', () => {
    expect(() =>
      refusedDeletes({ deleted: 3, errors: [], remaining: true }),
    ).toThrow('3 deleted, but some files are left');
  });

  it('passes a clean delete', () => {
    const result = { deleted: 2, errors: [], remaining: false };
    expect(refusedDeletes(result)).toBe(result);
  });

  it('offers shared keys and the user’s own, not other members’', () => {
    const keys = [
      { uuid: 'shared', user_uuid: null },
      { uuid: 'mine', user_uuid: 'me' },
      { uuid: 'theirs', user_uuid: 'someone' },
    ] as any;
    expect(usableKeys(keys, 'me').map((key) => key.uuid)).toEqual([
      'shared',
      'mine',
    ]);
  });
});
