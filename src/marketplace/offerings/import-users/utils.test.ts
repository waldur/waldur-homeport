import { describe, expect, it } from 'vitest';

import { validateOfferingUserCreation } from './utils';

const row = {
  uuid: 'row-1',
  offering_uuid: 'offering-1',
  user_uuid: 'user-1',
  username: 'jdoe',
} as any;

describe('validateOfferingUserCreation', () => {
  it('needs a username for an offering with accounts of its own', () => {
    const result = validateOfferingUserCreation({ ...row, username: '' });
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain('username');
  });

  it('needs none where the offering shares provider accounts', () => {
    const result = validateOfferingUserCreation({
      ...row,
      username: '',
      provider_account: true,
    });
    expect(result.valid).toBeTruthy();
    expect(result.errors).not.toContain('username');
  });

  it('accepts a complete row', () => {
    expect(validateOfferingUserCreation(row).valid).toBeTruthy();
  });
});
