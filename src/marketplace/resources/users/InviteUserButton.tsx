import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { marketplaceOfferingRolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
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

export const InviteUserButton: FC<ScopeArgs> = (props) => {
  const { openDialog } = useModal();
  const { showErrorResponse } = useNotify();

  const openResourceInvitationDialog = useCallback(async () => {
    let roles = [];
    if (props.offeringUuid) {
      try {
        const all = await getAllPages((page) =>
          marketplaceOfferingRolesList({
            query: { offering_uuid: props.offeringUuid, page },
          }),
        );
        roles = all.filter(
          (r) => !r.content_type || r.content_type === props.contentType,
        );
      } catch (error) {
        showErrorResponse(error, translate('Unable to load offering roles.'));
        return;
      }
    }
    openDialog(InvitationCreateDialog, {
      resolve: {
        user: props.user,
        scope: { url: props.scopeUrl, uuid: props.scopeUuid },
        scopeLabel: props.scopeLabel,
        rolesOverride: roles,
        roleTypes: [],
        enableBulkUpload: true,
        refetch: props.refetch,
      },
      size: 'xl',
    });
  }, [props, openDialog, showErrorResponse]);

  return (
    <ActionItem
      title={translate('Invite')}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
      action={openResourceInvitationDialog}
    />
  );
};
