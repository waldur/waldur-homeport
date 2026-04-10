import { describe, expect, it, vi } from 'vitest';

import { MarketplaceFilterItem } from '../types';

import { getContextFiltersForOfferings } from './selectors';

vi.mock('@waldur/core/filters', () => ({
  getInitialValues: () => ({}),
}));

describe('getContextFiltersForOfferings', () => {
  it('returns null when no filters are set', () => {
    const result = getContextFiltersForOfferings([]);
    expect(result).toBeNull();
  });

  it('returns customer filter when organization is set', () => {
    const filters: MarketplaceFilterItem[] = [
      { name: 'organization', value: { uuid: 'org-1', name: 'Org' } },
    ];
    const result = getContextFiltersForOfferings(filters);
    expect(result).toEqual({ allowed_customer_uuid: 'org-1' });
  });

  it('returns tag filter when tag is set', () => {
    const filters: MarketplaceFilterItem[] = [
      { name: 'tag', value: { uuid: 'tag-1', name: 'My Tag' } },
    ];
    const result = getContextFiltersForOfferings(filters);
    expect(result).toEqual({ tag: 'tag-1' });
  });

  it('returns combined filters when organization and tag are set', () => {
    const filters: MarketplaceFilterItem[] = [
      { name: 'organization', value: { uuid: 'org-1', name: 'Org' } },
      { name: 'tag', value: { uuid: 'tag-1', name: 'My Tag' } },
    ];
    const result = getContextFiltersForOfferings(filters);
    expect(result).toEqual({
      allowed_customer_uuid: 'org-1',
      tag: 'tag-1',
    });
  });

  it('returns all three filters when organization, project, and tag are set', () => {
    const filters: MarketplaceFilterItem[] = [
      { name: 'organization', value: { uuid: 'org-1', name: 'Org' } },
      { name: 'project', value: { uuid: 'proj-1', name: 'Proj' } },
      { name: 'tag', value: { uuid: 'tag-1', name: 'My Tag' } },
    ];
    const result = getContextFiltersForOfferings(filters);
    expect(result).toEqual({
      allowed_customer_uuid: 'org-1',
      project_uuid: 'proj-1',
      tag: 'tag-1',
    });
  });

  it('handles tag filter from URL when filters are empty', async () => {
    // Re-mock to return tag from URL
    const filtersModule = await import('@waldur/core/filters');
    vi.spyOn(filtersModule, 'getInitialValues').mockReturnValue({
      tag: { uuid: 'url-tag-1', name: 'URL Tag' },
    } as any);

    const result = getContextFiltersForOfferings([]);
    expect(result).toEqual({ tag: 'url-tag-1' });
  });
});
