import { ProhibitIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userInvitationsCancel } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';
import { getCustomer, getProject } from '@/workspace/selectors';

import { InvitationPolicyService } from './InvitationPolicyService';

export const InvitationCancelButton = ({ row, refetch }) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const user = useUser();
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const callback = async () => {
    try {
      await userInvitationsCancel({ path: { uuid: row.uuid } });
      showSuccess(translate('Invitation has been canceled.'));
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to cancel invitation.'));
    }
  };

  const isDisabled = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        row,
      )
    ) {
      return true;
    }
    if (row.state !== 'pending' && row.state !== 'project') {
      return true;
    }
    return false;
  }, [user, customer, row]);

  const tooltip = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        row,
      )
    ) {
      return translate("You don't have permission to cancel this invitation.");
    }

    if (row.state !== 'pending' && row.state !== 'project') {
      return translate('Only pending or planned invitations can be canceled.');
    }
  }, [user, customer, row]);

  return (
    <ActionItem
      action={callback}
      title={translate('Cancel')}
      iconNode={<ProhibitIcon weight="bold" />}
      disabled={isDisabled}
      tooltip={tooltip}
    />
  );
};
