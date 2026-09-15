import { describe, expect, it } from 'vitest';

import { getMatrixRoomUrl } from './utils';

describe('getMatrixRoomUrl', () => {
  it('addresses the room by its alias on matrix.to', () => {
    expect(getMatrixRoomUrl('#waldur-56c85843:matrix.example.com')).toBe(
      'https://matrix.to/#/%23waldur-56c85843%3Amatrix.example.com',
    );
  });

  it('accepts an alias that arrives without its leading sigil', () => {
    expect(getMatrixRoomUrl('waldur-56c85843:matrix.example.com')).toBe(
      'https://matrix.to/#/%23waldur-56c85843%3Amatrix.example.com',
    );
  });

  it('has no address for a room that has no alias yet', () => {
    expect(getMatrixRoomUrl('')).toBeNull();
    expect(getMatrixRoomUrl(undefined)).toBeNull();
  });
});
