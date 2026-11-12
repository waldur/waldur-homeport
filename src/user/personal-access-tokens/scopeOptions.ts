import { PermissionOptions } from '@/administration/roles/PermissionOptions';
import { PermissionEnum } from '@/permissions/enums';

// Permissions a personal access token cannot exercise, whatever its scopes. The
// backend never reveals a resource API key to a token, so offering the reveal
// permission as a scope would promise access the token never gets.
const TOKEN_UNUSABLE_PERMISSIONS: ReadonlySet<string> = new Set<string>([
  PermissionEnum.REVEAL_RESOURCE_API_KEY,
]);

/** The scopes a new token can be given: those the user may delegate, labelled
 * with their group, less the ones no token can use. */
export const getScopeOptions = (
  availableScopes: ReadonlySet<string>,
): { value: string; label: string }[] => {
  const result: { value: string; label: string }[] = [];
  for (const group of PermissionOptions) {
    for (const opt of group.options) {
      if (
        availableScopes.has(opt.value) &&
        !TOKEN_UNUSABLE_PERMISSIONS.has(opt.value)
      ) {
        result.push({
          value: opt.value,
          label: `${group.label}: ${opt.label}`,
        });
      }
    }
  }
  return result;
};
