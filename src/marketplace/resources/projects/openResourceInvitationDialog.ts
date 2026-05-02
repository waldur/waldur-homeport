import { marketplaceOfferingRolesList } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ModalService } from '@/modal/actions';
import { Role } from '@/permissions/types';
import { NotifyService } from '@/store/notify';
import { User } from '@/workspace/types';

const InvitationCreateDialog = lazyComponent(() =>
  import('@/invitations/actions/create/InvitationCreateDialog').then(
    (module) => ({ default: module.InvitationCreateDialog }),
  ),
);

interface ScopeArgs {
  scopeUrl: string;
  scopeUuid: string;
  scopeLabel: string;
  contentType: 'resource' | 'resource_project';
  offeringUuid?: string;
  user: User;
  refetch?: () => void;
}

/**
 * Open the canonical multi-step invitation wizard for a resource or
 * resource_project scope. Roles are fetched from
 * `marketplaceOfferingRolesList` (where RoleAvailability is enforced
 * server-side) and supplied via the wizard's `rolesOverride` hook —
 * bypassing the org-only ENV.roles + InvitationPolicyService filtering.
 */
export const openResourceInvitationDialog = async (args: ScopeArgs) => {
  let roles: Role[] = [];
  if (args.offeringUuid) {
    try {
      const response = await marketplaceOfferingRolesList({
        query: { offering_uuid: args.offeringUuid, page_size: 100 },
      });
      const all = (response.data as any[]) || [];
      roles = all.filter(
        (r) => !r.content_type || r.content_type === args.contentType,
      ) as unknown as Role[];
    } catch (error) {
      NotifyService.errorResponse(
        error,
        translate('Unable to load offering roles.'),
      );
      return;
    }
  }
  ModalService.open(InvitationCreateDialog, {
    resolve: {
      user: args.user,
      scope: { url: args.scopeUrl, uuid: args.scopeUuid },
      scopeLabel: args.scopeLabel,
      rolesOverride: roles,
      roleTypes: [],
      enableBulkUpload: true,
      refetch: args.refetch,
    },
    size: 'xl',
  });
};
