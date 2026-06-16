import { describe, expect, it } from 'vitest';

import { mergeOfferingUsersByUuid } from './offeringUserAttention';

describe('mergeOfferingUsersByUuid', () => {
  it('deduplicates offering users by uuid', () => {
    const users = [
      { uuid: '1', state: 'OK', runtime_state: 'Active' },
      { uuid: '1', state: 'OK', runtime_state: 'Pending account linking' },
      { uuid: '2', state: 'Pending account linking' },
    ];

    expect(mergeOfferingUsersByUuid(users)).toEqual([
      { uuid: '1', state: 'OK', runtime_state: 'Pending account linking' },
      { uuid: '2', state: 'Pending account linking' },
    ]);
  });
});
