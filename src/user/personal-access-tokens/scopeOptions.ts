import { PermissionOptions } from '@/administration/roles/PermissionOptions';
import { PermissionEnum } from '@/permissions/enums';

// Permissions a personal access token cannot exercise, whatever its scopes. The
// backend never reveals a resource API key to a token, so offering the reveal
// permission as a scope would promise access the token never gets.
const TOKEN_UNUSABLE_PERMISSIONS: ReadonlySet<string> = new Set<string>([
  PermissionEnum.REVEAL_RESOURCE_API_KEY,
]);

// Scopes that are inherently global and cannot be combined with entity bindings.
// Keep in sync with the backend serializer's exclusivity check.
export const GLOBAL_SCOPES: ReadonlySet<string> = new Set([
  'STAFF.ACCESS',
  'SUPPORT.ACCESS',
]);

export interface ScopeOption {
  value: string;
  label: string;
}

export interface ScopeGroup {
  label: string;
  options: ScopeOption[];
}

/** The scopes a new token can be given, in their permission groups: those the
 * user may delegate, less the ones no token can use. Empty groups are left out. */
export const getScopeGroups = (
  availableScopes: ReadonlySet<string>,
): ScopeGroup[] =>
  PermissionOptions.map((group) => ({
    label: group.label,
    options: group.options.filter(
      (opt) =>
        availableScopes.has(opt.value) &&
        !TOKEN_UNUSABLE_PERMISSIONS.has(opt.value),
    ),
  })).filter((group) => group.options.length > 0);

/** The scopes a new token can be given, each labelled with its group. */
export const getScopeOptions = (
  availableScopes: ReadonlySet<string>,
): ScopeOption[] =>
  getScopeGroups(availableScopes).flatMap((group) =>
    group.options.map((opt) => ({
      value: opt.value,
      label: `${group.label}: ${opt.label}`,
    })),
  );

let permissionLabels: Map<string, string> | undefined;

/** A permission's readable name, or the permission itself when it has none. */
export const getPermissionLabel = (permission: string): string => {
  if (!permissionLabels) {
    permissionLabels = new Map(
      PermissionOptions.flatMap((group) =>
        group.options.map((opt) => [opt.value, opt.label] as const),
      ),
    );
  }
  return permissionLabels.get(permission) ?? permission;
};
