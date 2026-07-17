import { rolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';

// Fields needed by the global ENV.roles cache (client-side permission checks
// in @/permissions, role-name/description lookups, autocompletes). `permissions`
// must stay — hasPermission() relies on it. The 14 description_<lang>
// translations are dropped here since no ENV.roles consumer reads them.
const ROLES_CACHE_FIELDS = [
  'uuid',
  'name',
  'content_type',
  'description',
  'is_active',
  'permissions',
] as const;

export const getRoles = (options?: Parameters<typeof rolesList>[0]) =>
  getAllPages((page) =>
    rolesList({
      ...options,
      query: { field: ROLES_CACHE_FIELDS, page, ...options?.query },
    }),
  );
