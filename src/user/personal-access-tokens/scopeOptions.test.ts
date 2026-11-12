import { describe, expect, it } from 'vitest';

import { PermissionEnum } from '@/permissions/enums';

import { getScopeOptions } from './scopeOptions';

describe('getScopeOptions', () => {
  it('offers the permissions the user may delegate, labelled with their group', () => {
    expect(getScopeOptions(new Set([PermissionEnum.LIST_RESOURCES]))).toEqual([
      {
        value: PermissionEnum.LIST_RESOURCES,
        label: 'Customer actions for resources: List resource',
      },
    ]);
  });

  it('leaves out permissions the user may not delegate', () => {
    expect(getScopeOptions(new Set())).toEqual([]);
  });

  // The backend never reveals a resource API key to a token, so the scope
  // would grant nothing.
  it('never offers revealing API keys, even to a user who holds it', () => {
    const options = getScopeOptions(
      new Set([
        PermissionEnum.LIST_RESOURCES,
        PermissionEnum.REVEAL_RESOURCE_API_KEY,
      ]),
    );
    expect(options.map(({ value }) => value)).toEqual([
      PermissionEnum.LIST_RESOURCES,
    ]);
  });
});
