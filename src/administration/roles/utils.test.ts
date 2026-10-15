import { describe, expect, it } from 'vitest';

import { ROLES_CACHE_FIELDS } from './utils';

describe('ENV.roles cache fields', () => {
  // hasPermission() reads `permissions`; isRoleOrClone() reads `template_name`
  // to treat an organization clone (CUSTOMER.<slug>.OWNER) as the role it
  // copies. Dropping either silently closes screens to the users who hold them.
  it.each(['name', 'permissions', 'template_name'])('keeps %s', (field) => {
    expect(ROLES_CACHE_FIELDS).toContain(field);
  });
});
