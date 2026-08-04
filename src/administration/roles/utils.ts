import { rolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { isMatchPattern } from '@/core/validators';
import { translate } from '@/i18n';

/**
 * `Role.name` is a technical code, not a label — it is globally unique, it is
 * the identifier sent as `role_name` in permission payloads, and the backend
 * derives a role's scope from its `SCOPE.` prefix (see `build_org_role_name`
 * and the `name__startswith="PROJECT."` querysets in waldur-mastermind). The
 * human-readable label lives in `description`.
 */
const ROLE_CODE_PATTERN = /^[A-Z][A-Z0-9_]*\.[A-Z0-9_]+$/;

/**
 * Only applied when creating a role. Deployment-wide roles created before the
 * convention was enforced, and organization clones (`PROJECT.<slug>.ADMIN`,
 * whose slug segment is lowercase), must stay editable.
 */
export const isRoleCode = isMatchPattern(
  ROLE_CODE_PATTERN,
  translate('Use the SCOPE.NAME format, e.g. PROJECT.RESEARCHER.'),
);

// Fields needed by the global ENV.roles cache (client-side permission checks
// in @/permissions, role-name/description lookups, autocompletes). `permissions`
// must stay — hasPermission() relies on it. `is_system_role` must stay — the
// clone-role and auto-provisioning pickers filter on it, and dropping it makes
// them silently empty. The 14 description_<lang> translations are dropped here
// since no ENV.roles consumer reads them.
const ROLES_CACHE_FIELDS = [
  'uuid',
  'name',
  'content_type',
  'description',
  'is_active',
  'is_system_role',
  'permissions',
] as const;

export const getRoles = (options?: Parameters<typeof rolesList>[0]) =>
  getAllPages((page) =>
    rolesList({
      ...options,
      query: { field: ROLES_CACHE_FIELDS, page, ...options?.query },
    }),
  );
