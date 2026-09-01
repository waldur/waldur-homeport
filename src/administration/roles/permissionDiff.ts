import { RoleDetails } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

import { PermissionOptions } from './PermissionOptions';

// Flat code -> human label map, built once from the generated grouped options.
const PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  PermissionOptions.flatMap((entity) =>
    entity.options.map((option) => [option.value, option.label]),
  ),
);

/**
 * Human label for a permission code, falling back to the code itself so a
 * permission the backend has but the generated description list has not caught
 * up with is still rendered rather than silently dropped.
 */
export const getPermissionLabel = (code: string) =>
  PERMISSION_LABELS[code] ?? code;

/**
 * The permissions of a role, or undefined when they are not known here. The
 * roles list response is trimmed and no longer carries `permissions` (see
 * RolesList), but ENV.roles holds every role with its full permission list and
 * is refreshed after every role mutation, so a diff needs no extra request.
 *
 * A role the cache has not seen — created in another tab, or fetched before a
 * failed refresh — returns undefined rather than an empty list, so callers
 * render nothing instead of claiming the role lost every permission.
 */
export const getRolePermissions = (
  role: Pick<RoleDetails, 'uuid' | 'permissions'>,
): string[] | undefined => {
  if (role.permissions) {
    return [...role.permissions];
  }
  const cached = ENV.roles.find((item) => item.uuid === role.uuid);
  return cached?.permissions ? [...cached.permissions] : undefined;
};

export interface PermissionDiff {
  added: string[];
  removed: string[];
  kept: string[];
}

/** What `target` adds to and removes from `base`, as permission codes. */
export const getPermissionDiff = (
  base: readonly string[] = [],
  target: readonly string[] = [],
): PermissionDiff => {
  const baseSet = new Set(base);
  const targetSet = new Set(target);
  return {
    added: target.filter((code) => !baseSet.has(code)),
    removed: base.filter((code) => !targetSet.has(code)),
    kept: target.filter((code) => baseSet.has(code)),
  };
};

export const isEmptyDiff = (diff: PermissionDiff) =>
  diff.added.length === 0 && diff.removed.length === 0;

const OTHER_GROUP = translate('Other');

export interface PermissionGroup {
  label: string;
  codes: string[];
}

/**
 * Split permission codes into the same entity groups the permission editor
 * renders, in the same order, so a diff reads like the editor it explains.
 * Codes outside the generated groups are kept in a trailing group rather than
 * dropped.
 */
export const groupPermissions = (
  codes: readonly string[],
): PermissionGroup[] => {
  const remaining = new Set(codes);
  const groups: PermissionGroup[] = [];
  PermissionOptions.forEach((entity) => {
    const matched = entity.options
      .map((option) => option.value)
      .filter((code) => remaining.has(code));
    matched.forEach((code) => remaining.delete(code));
    if (matched.length) {
      groups.push({ label: entity.label, codes: matched });
    }
  });
  if (remaining.size) {
    // The generated list has an "Other" group of its own; unknown codes join it
    // rather than opening a second group under the same name.
    const fallback = groups.find((group) => group.label === OTHER_GROUP);
    if (fallback) {
      fallback.codes.push(...remaining);
    } else {
      groups.push({ label: OTHER_GROUP, codes: Array.from(remaining) });
    }
  }
  return groups;
};
