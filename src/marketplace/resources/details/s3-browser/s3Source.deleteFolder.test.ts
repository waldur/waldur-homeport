import { describe, expect, it, vi } from 'vitest';
import { marketplaceResourceApiKeysS3DeleteObjects } from 'waldur-js-client';

import { s3Source } from './s3Source';

describe('s3Source.deleteFolder', () => {
  // Each round lists the prefix afresh, so a refused key comes back each time.
  it('counts a key the gateway keeps refusing once', async () => {
    const refused = { key: 'logs/locked', code: 'AccessDenied', detail: '' };
    vi.mocked(marketplaceResourceApiKeysS3DeleteObjects)
      .mockResolvedValueOnce({
        data: { deleted: 1000, errors: [refused], remaining: true },
      } as any)
      .mockResolvedValueOnce({
        data: { deleted: 500, errors: [refused], remaining: false },
      } as any);

    const result = await s3Source('key-1').deleteFolder('data', 'logs/');

    expect(result.deleted).toBe(1500);
    expect(result.errors).toEqual([refused]);
  });
});
