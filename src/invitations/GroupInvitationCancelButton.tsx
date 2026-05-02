import { XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { GroupInvitation, userGroupInvitationsCancel } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface GroupInvitationCancelButtonProps {
  invitation: GroupInvitation;
  refetch;
}

export const GroupInvitationCancelButton: FunctionComponent<
  GroupInvitationCancelButtonProps
> = ({ invitation: permissionRequest, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      userGroupInvitationsCancel({
        path: { uuid: permissionRequest.uuid },
      }),
    confirmation: {
      title: translate('Cancel invitation'),
      body: translate(
        'You are going to cancel invitation by {name}. This action cannot be undone.',
        { name: permissionRequest.created_by_full_name },
      ),
      options: {
        type: 'danger',
        size: 'sm',
        positiveButton: translate('Confirm'),
        negativeButton: translate('Cancel'),
        positiveButtonVariant: 'danger',
        iconNode: <XCircleIcon weight="bold" />,
      },
    },
    successMessage: translate('Group invitation has been cancelled.'),
    errorMessage: translate('Unable to cancel group invitation.'),
    refetch,
  });
  return (
    <ActionItem
      action={mutate}
      title={translate('Cancel')}
      iconNode={<XCircleIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={!permissionRequest.is_active || isPending}
    />
  );
};
