import { describe, expect, it } from 'vitest';

import { getMyWorkTitle } from './myWorkTitle';

describe('getMyWorkTitle', () => {
  it('names a reviewer’s work reviews', () => {
    expect(
      getMyWorkTitle({
        permissions: [{ scope_type: 'call', role_name: 'CALL.REVIEWER' }],
      }),
    ).toBe('My reviews');
  });

  it('names a panel member’s work reviews', () => {
    expect(
      getMyWorkTitle({
        permissions: [{ scope_type: 'call', role_name: 'CALL.PANEL_MEMBER' }],
      }),
    ).toBe('My reviews');
  });

  it('names an offering manager’s work tasks', () => {
    expect(
      getMyWorkTitle({
        permissions: [
          { scope_type: 'offering', role_name: 'OFFERING.MANAGER' },
        ],
      }),
    ).toBe('My tasks');
  });

  it('names the work of someone without roles tasks', () => {
    expect(getMyWorkTitle(undefined)).toBe('My tasks');
  });
});
