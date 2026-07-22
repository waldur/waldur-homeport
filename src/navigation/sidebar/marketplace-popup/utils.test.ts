import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { mockListResponse } from '@/test/utils';

import { fetchOfferingsByPage } from './utils';

const customer = { uuid: 'customer-uuid' } as any;
const project = { uuid: 'project-uuid' } as any;
const category = { uuid: 'category-uuid' } as any;

describe('fetchOfferingsByPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports the TOTAL result count, not just the length of the page', async () => {
    // One page of 20 offerings, but 44 exist in total. If itemCount were the
    // page length, InfiniteLoader would never request pages 2+ and the popup
    // would cap the list at 20 (the bug this guards against).
    const page = Array.from({ length: 20 }, (_, i) => ({
      uuid: `offering-${i}`,
    }));
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue(
      mockListResponse(page, 44),
    );

    const result = await fetchOfferingsByPage(
      customer,
      project,
      category,
      '',
      1,
      20,
    );

    expect(result.pageElements).toHaveLength(20);
    expect(result.itemCount).toBe(44);
  });

  it('falls back to the page length when the count header is missing', async () => {
    const page = Array.from({ length: 7 }, (_, i) => ({
      uuid: `offering-${i}`,
    }));
    const response = mockListResponse(page);
    response.response.headers.delete('x-result-count');
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue(response);

    const result = await fetchOfferingsByPage(
      customer,
      project,
      category,
      '',
      1,
      20,
    );

    expect(result.itemCount).toBe(7);
  });
});
