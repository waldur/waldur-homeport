import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { useOfferingRoles } from './useOfferingRoles';

const InvitationCreateDialog = lazyComponent(() =>
  import('@/invitations/actions/create/InvitationCreateDialog').then(
    (module) => ({ default: module.InvitationCreateDialog }),
  ),
);

interface InviteOfferingUserButtonProps {
  offering: Offering;
  refetch?(): void;
  disabled?: boolean;
  tooltip?: string;
}

/**
 * Invite a user by email into an offering. The generic invitation dialog needs
 * no offering-specific code — the backend accepts any scope in `TYPE_MAP`, and
 * `offering` is one of them — so this only supplies the scope, its label and
 * the roles grantable on it.
 */
export const InviteOfferingUserButton: FC<InviteOfferingUserButtonProps> = ({
  offering,
  refetch,
  disabled,
  tooltip,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  const { data: roles = [] } = useOfferingRoles(offering.customer_uuid);

  const openInvitationDialog = useCallback(() => {
    openDialog(InvitationCreateDialog, {
      resolve: {
        user,
        scope: { url: offering.url, uuid: offering.uuid },
        scopeLabel: offering.name,
        rolesOverride: roles,
        // Offering-scoped invitations never fall back to a customer or project
        // role, so no role type is offered alongside the override.
        roleTypes: [],
        enableBulkUpload: true,
        refetch,
      },
      size: 'xl',
    });
  }, [openDialog, user, offering, roles, refetch]);

  return (
    <ActionItem
      title={translate('Invite')}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
      action={openInvitationDialog}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
