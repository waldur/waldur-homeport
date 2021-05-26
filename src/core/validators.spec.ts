import { isGuid } from './validators';

describe('GUID validator', () => {
  it('returns undefined if GUID is valid', () => {
    expect(isGuid('c2bb9245-78cd-4bde-bb70-7b7649c30178')).toBeUndefined();
  });

  it('returns error message if GUID is invalid', () => {
    expect(isGuid('invalid-guid-string')).toBe('GUID is expected.');
  });
});
