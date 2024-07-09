import { Prohibit } from '@phosphor-icons/react';
import { useMemo, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser, getProject } from '@waldur/workspace/selectors';

import { InvitationService } from '../InvitationService';

import { InvitationPolicyService } from './InvitationPolicyService';

export const InvitationCancelButton: FC<{
  invitation;
  refetch;
}> = ({ invitation, refetch }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const callback = async () => {
    try {
      await InvitationService.cancel(invitation.uuid);
      dispatch(showSuccess(translate('Invitation has been canceled.')));
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to cancel invitation.')));
    }
  };

  const isDisabled = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        invitation,
      )
    ) {
      return true;
    }
    if (invitation.state !== 'pending') {
      return true;
    }
    return false;
  }, [user, customer, invitation]);

  const tooltip = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        invitation,
      )
    ) {
      return translate("You don't have permission to cancel this invitation.");
    }

    if (invitation.state !== 'pending') {
      return translate('Only pending invitation can be canceled.');
    }
  }, [user, customer, invitation]);

  return (
    <RowActionButton
      action={callback}
      title={translate('Cancel')}
      iconNode={<Prohibit />}
      disabled={isDisabled}
      tooltip={tooltip}
      size="sm"
    />
  );
};
