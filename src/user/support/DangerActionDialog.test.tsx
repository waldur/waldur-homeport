import { describe, expect, it } from 'vitest';

import { constructDangerActionPayload } from './DangerActionDialog';

describe('constructDangerActionPayload', () => {
  it('links the request to the resource by its URL', () => {
    const payload = constructDangerActionPayload(
      {
        issueSummary: 'Longhorn removal',
        resource: {
          uuid: 'r1',
          name: 'prod-cluster',
          url: 'https://example.com/api/marketplace-resources/r1/',
        } as any,
      },
      'Keep the backups.',
    );

    expect(payload).toEqual({
      type: 'Change Request',
      description: 'Keep the backups.',
      summary: 'Longhorn removal',
      is_reported_manually: true,
      resource: 'https://example.com/api/marketplace-resources/r1/',
    });
  });

  it('sends no resource when the request is not about one', () => {
    const payload = constructDangerActionPayload(
      { issueSummary: 'Account deletion' },
      'Please remove my account.',
    );

    expect(payload).not.toHaveProperty('resource');
  });
});
