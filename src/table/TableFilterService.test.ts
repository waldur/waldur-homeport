import { beforeEach, describe, expect, it } from 'vitest';

import { TableFilterService } from './TableFilterService';

const KEY = 'test/saved-filters';
const group = (title: string, id?: string) => ({
  id,
  title,
  date: '2026-01-01',
  values: {},
});

describe('TableFilterService', () => {
  beforeEach(() => localStorage.clear());

  // Ids are counted from 1 again on every page load, so the ones a previous
  // load stored can come up again; a new group must not take one of them.
  it('gives a new group an id no stored group has', () => {
    const stored = Array.from({ length: 50 }, (_, i) =>
      group(`Stored ${i}`, String(i + 1)),
    );
    localStorage.setItem(KEY, JSON.stringify(stored));

    TableFilterService.addOrReplace(KEY, group('New'));

    const list = TableFilterService.list(KEY);
    expect(list).toHaveLength(51);
    expect(new Set(list.map((g) => g.id)).size).toBe(51);
    expect(list[50].title).toBe('New');
  });

  it('replaces the group with the same id', () => {
    TableFilterService.addOrReplace(KEY, group('First', 'g1'));
    TableFilterService.addOrReplace(KEY, group('Renamed', 'g1'));

    expect(TableFilterService.list(KEY)).toEqual([group('Renamed', 'g1')]);
  });
});
