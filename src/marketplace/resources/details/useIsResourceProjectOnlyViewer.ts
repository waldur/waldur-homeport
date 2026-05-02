import { Resource } from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

/**
 * True when the current user can only see ``resource`` via a
 * ResourceProject UserRole. Staff/support and users with project, customer
 * or direct resource permissions are NOT rp-only.
 */
export const useIsResourceProjectOnlyViewer = (
  resource: Pick<Resource, 'uuid' | 'project_uuid' | 'customer_uuid'> | null,
): boolean => {
  const user = useUser();
  if (!user || !resource) return false;
  if (user.is_staff || user.is_support) return false;
  const perms = user.permissions || [];
  const hasFullAccess = perms.some(
    (p) =>
      (p.scope_type === 'customer' &&
        p.scope_uuid === resource.customer_uuid) ||
      (p.scope_type === 'project' && p.scope_uuid === resource.project_uuid) ||
      (p.scope_type === 'resource' && p.scope_uuid === resource.uuid),
  );
  if (hasFullAccess) return false;
  return perms.some((p) => p.scope_type === 'resource_project');
};
