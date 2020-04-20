import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const statesForResend = ['pending', 'expired'];

export const InvitationSendButton = ({ invitation }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const callback = async () => {
    try {
      await ngInjector.get('invitationService').resend(invitation.uuid);
      dispatch(showSuccess(translate('Invitation has been sent again.')));
    } catch (e) {
      dispatch(showError(translate('Unable to resend invitation.')));
    }
  };

  const isDisabled = React.useMemo(() => {
    if (
      !ngInjector
        .get('InvitationPolicyService')
        .canManageInvitation({ user, customer }, invitation)
    ) {
      return true;
    }
    if (statesForResend.indexOf(invitation.state) === -1) {
      return true;
    }
    return false;
  }, [user, customer, invitation]);

  const tooltip = React.useMemo(() => {
    if (
      !ngInjector
        .get('InvitationPolicyService')
        .canManageInvitation({ user, customer }, invitation)
    ) {
      return translate("You don't have permission to send this invitation.");
    }

    if (statesForResend.indexOf(invitation.state) === -1) {
      return translate(
        'Only pending and expired invitations can be sent again.',
      );
    }
  }, [user, customer, invitation]);

  return (
    <ActionButton
      action={callback}
      title={translate('Resend')}
      icon="fa fa-envelope-o"
      disabled={isDisabled}
      tooltip={tooltip}
    />
  );
};
