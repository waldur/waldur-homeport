import { describe, it, expect } from 'vitest';

import {
  countSelectedFilters,
  countSelectedFilterValues,
  getGroupedCategories,
} from './utils';

describe('countSelectedFilters', () => {
  it('should count total number of selected filters', () => {
    const filterValues = {
      'boolean-approved-5': 'true',
      'choice-security_at_rest-3': 'very_secure',
      'list-security_in_transit-0': 'option2',
      'list-security_in_transit-1': 'option1',
    };
    expect(countSelectedFilters(filterValues)).toEqual(3);
  });
});

describe('countSelectedFilterValues', () => {
  it('should count selected values for a particular filter', () => {
    const filterValues = {
      'boolean-approved-5': 'true',
      'choice-security_at_rest-3': 'very_secure',
      'list-security_in_transit-0': 'option2',
      'list-security_in_transit-1': 'option1',
    };
    expect(
      countSelectedFilterValues(filterValues, 'security_in_transit'),
    ).toEqual(2);
  });
});

describe('getGroupedCategories', () => {
  it('groups categories and aggregates counts without mutating inputs', () => {
    const categoryGroup = Object.freeze({
      uuid: 'group-1',
      title: 'Compute',
      url: '/api/marketplace-category-groups/group-1/',
    });
    const categories = [
      Object.freeze({
        uuid: 'cat-1',
        title: 'Virtual Machines',
        group: '/api/marketplace-category-groups/group-1/',
        offering_count: 5,
        resource_count: 2,
      }),
      Object.freeze({
        uuid: 'cat-2',
        title: 'Bare Metal',
        group: '/api/marketplace-category-groups/group-1/',
        offering_count: 3,
        resource_count: 4,
      }),
      Object.freeze({
        uuid: 'cat-3',
        title: 'Storage',
        group: undefined,
        offering_count: 1,
        resource_count: 0,
      }),
    ];

    const result = getGroupedCategories(
      categories as any,
      [categoryGroup] as any,
    );

    expect(result).toHaveLength(2);

    const group = result[0];
    expect(group.uuid).toBe('group-1');
    expect(group.title).toBe('Compute');
    expect(group.offering_count).toBe(8);
    expect(group.resource_count).toBe(6);
    expect(group.categories).toHaveLength(2);
    expect(group.categories?.[0].uuid).toBe('cat-1');
    expect(group.categories?.[1].uuid).toBe('cat-2');

    // Non-grouped category is preserved
    expect(result[1].uuid).toBe('cat-3');

    // Original categoryGroup in cache was NOT mutated
    expect((categoryGroup as any).categories).toBeUndefined();
    expect((categoryGroup as any).offering_count).toBeUndefined();
    expect((categoryGroup as any).resource_count).toBeUndefined();
  });
});
