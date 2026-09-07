import { describe, expect, it, vi } from 'vitest';
import { marketplaceProviderResourcesPlanPeriodsList } from 'waldur-js-client';

import { getProviderUsageComponents } from './api';

describe('getProviderUsageComponents', () => {
  it('returns an empty components array, not null, when offering_uuid is absent', async () => {
    vi.mocked(marketplaceProviderResourcesPlanPeriodsList).mockResolvedValue({
      data: [],
    } as any);

    const result = await getProviderUsageComponents({
      resource_uuid: 'resource-1',
      resource_name: 'Resource 1',
      offering_uuid: undefined,
    } as any);

    // Regression: ResourceCreateUsageDialog.tsx reads
    // `value.components.length` unconditionally to decide whether to show
    // the "no usage-based components" empty state -- a null `components`
    // crashes there instead.
    expect(result.components).toEqual([]);
  });
});
