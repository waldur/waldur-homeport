import { Share } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getCustomer, getUser, getProject } from '@waldur/workspace/selectors';

import { InvitationService } from '../InvitationService';

import { InvitationPolicyService } from './InvitationPolicyService';

const statesForResend = ['pending', 'expired'];

export const InvitationSendButton = ({ row }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const callback = async () => {
    try {
      await InvitationService.resend(row.uuid);
      dispatch(showSuccess(translate('Invitation has been sent again.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to resend invitation.')));
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
    if (statesForResend.indexOf(row.state) === -1) {
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
      return translate("You don't have permission to send this invitation.");
    }

    if (statesForResend.indexOf(row.state) === -1) {
      return translate(
        'Only pending and expired invitations can be sent again.',
      );
    }
  }, [user, customer, row]);

  return (
    <ActionItem
      action={callback}
      title={translate('Resend')}
      iconNode={<Share />}
      disabled={isDisabled}
      tooltip={tooltip}
    />
  );
};
