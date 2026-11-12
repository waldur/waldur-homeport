import { beforeEach, describe, expect, it } from 'vitest';

import { TableFilterService } from './TableFilterService';
import { getSavedFiltersKey } from './utils';

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

  // The key and the stored shape are a contract between homeport and the
  // micro-apps, which share one origin's localStorage: a filter saved in one
  // app shows up in the others. Changing either loses every user's saved
  // filters unless each app ships a migration.
  it('stores groups under the shared key, in the shared shape', () => {
    const key = getSavedFiltersKey('projects', 'ProjectsFilter');
    expect(key).toBe('waldur/table/filters/projects/ProjectsFilter');

    TableFilterService.addOrReplace(key, {
      title: 'Mine',
      date: '2026-01-01',
      values: { query: 'abc' },
    });

    const stored = JSON.parse(localStorage.getItem(key));
    expect(stored).toEqual([
      {
        id: expect.any(String),
        title: 'Mine',
        date: '2026-01-01',
        values: { query: 'abc' },
      },
    ]);
    expect(Object.keys(stored[0]).sort()).toEqual([
      'date',
      'id',
      'title',
      'values',
    ]);
  });
});
