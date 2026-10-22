import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useRecentSearch } from './RecentSearchService';

const add = (
  result: { current: ReturnType<typeof useRecentSearch> },
  params?: Record<string, string>,
) =>
  act(() =>
    result.current.addRecentSearch(
      { title: 'Alpha', to: 'project.dashboard', params },
      'project',
    ),
  );

describe('useRecentSearch', () => {
  beforeEach(() => localStorage.clear());

  it('stores the item without its null params', () => {
    const { result } = renderHook(() => useRecentSearch());

    add(result, { uuid: 'p1', tab: null });

    expect(result.current.recentSearchItems).toHaveLength(1);
    expect(result.current.recentSearchItems[0].params).toEqual({ uuid: 'p1' });
  });

  it('adds the same item once', () => {
    const { result } = renderHook(() => useRecentSearch());

    add(result, { uuid: 'p1' });
    add(result, { uuid: 'p1', tab: null });

    expect(result.current.recentSearchItems).toHaveLength(1);
  });

  it('stores an item without params as empty params, and adds it once', () => {
    const { result } = renderHook(() => useRecentSearch());

    add(result);
    add(result);

    expect(result.current.recentSearchItems).toHaveLength(1);
    expect(result.current.recentSearchItems[0].params).toEqual({});
  });

  it('keeps items with different params apart', () => {
    const { result } = renderHook(() => useRecentSearch());

    add(result, { uuid: 'p1' });
    add(result, { uuid: 'p2' });

    expect(result.current.recentSearchItems).toHaveLength(2);
  });
});
