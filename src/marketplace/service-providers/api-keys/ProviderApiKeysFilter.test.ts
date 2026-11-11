import { describe, expect, it } from 'vitest';

import {
  getAssigneeLabel,
  getOfferingLabel,
  getRowOptionsLoader,
  selectProviderApiKeysFilter,
} from './ProviderApiKeysFilter';

describe('selectProviderApiKeysFilter', () => {
  it('maps every picker to its query parameter', () => {
    expect(
      selectProviderApiKeysFilter({
        offering: { uuid: 'o' } as any,
        customer: { uuid: 'c', name: 'C' },
        project: { uuid: 'p', name: 'P' },
        state: [
          { value: 'OK', label: 'OK' },
          { value: 'Erred', label: 'Erred' },
        ],
        paused_by_limit: { value: false, label: 'Not paused by a limit' },
        user: { uuid: 'u', full_name: 'U' },
      }),
    ).toEqual({
      offering_uuid: 'o',
      customer_uuid: 'c',
      project_uuid: 'p',
      state: ['OK', 'Erred'],
      paused_by_limit: false,
      user_uuid: 'u',
    });
  });

  it('sends nothing for an empty form', () => {
    expect(selectProviderApiKeysFilter({ state: [] })).toEqual({});
    expect(selectProviderApiKeysFilter(undefined)).toEqual({});
  });
});

describe('getRowOptionsLoader', () => {
  const rows = [
    { customer_uuid: 'b', customer_name: 'Beta' },
    { customer_uuid: 'a', customer_name: 'Alpha' },
    { customer_uuid: 'b', customer_name: 'Beta' },
  ] as any[];
  const load = getRowOptionsLoader(rows, (row) => ({
    uuid: row.customer_uuid,
    name: row.customer_name,
  }));

  it('offers each value of the loaded keys once, by name', async () => {
    const result = await load('');
    expect(result.options).toEqual([
      { uuid: 'a', name: 'Alpha' },
      { uuid: 'b', name: 'Beta' },
    ]);
    expect(result.hasMore).toBe(false);
  });

  it('searches by name', async () => {
    const result = await load('alp');
    expect(result.options).toEqual([{ uuid: 'a', name: 'Alpha' }]);
  });

  it('skips keys without the value, such as a shared key with no assignee', async () => {
    const loadAssignees = getRowOptionsLoader(
      [{ user_uuid: null }] as any[],
      (row) =>
        row.user_uuid
          ? { uuid: row.user_uuid, name: row.user_full_name }
          : undefined,
    );
    expect((await loadAssignees('')).options).toEqual([]);
  });
});

describe('getAssigneeLabel', () => {
  it('names a provider user and an assignee taken from a key alike', () => {
    expect(getAssigneeLabel({ uuid: 'u', full_name: 'Alice Smith' })).toBe(
      'Alice Smith',
    );
    // The option the page-derived picker offers an offering manager.
    expect(getAssigneeLabel({ uuid: 'u', name: 'Alice Smith' })).toBe(
      'Alice Smith',
    );
  });
});

describe('getOfferingLabel', () => {
  it('names the category when the picker supplies it', () => {
    expect(
      getOfferingLabel({ uuid: 'o', name: 'Gateway', category_title: 'LLM' }),
    ).toBe('LLM / Gateway');
  });

  it('names the offering alone when a row supplies it', () => {
    expect(getOfferingLabel({ uuid: 'o', name: 'Gateway' })).toBe('Gateway');
  });
});
