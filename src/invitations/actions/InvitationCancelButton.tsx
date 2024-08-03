import { Prohibit } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getCustomer, getUser, getProject } from '@waldur/workspace/selectors';

import { InvitationService } from '../InvitationService';

import { InvitationPolicyService } from './InvitationPolicyService';

export const InvitationCancelButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const callback = async () => {
    try {
      await InvitationService.cancel(row.uuid);
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
        row,
      )
    ) {
      return true;
    }
    if (row.state !== 'pending') {
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

    if (row.state !== 'pending') {
      return translate('Only pending invitation can be canceled.');
    }
  }, [user, customer, row]);

  return (
    <ActionItem
      action={callback}
      title={translate('Cancel')}
      iconNode={<Prohibit />}
      disabled={isDisabled}
      tooltip={tooltip}
    />
  );
};
