import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const InvitationCancelButton = ({ invitation }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const callback = async () => {
    try {
      await ngInjector.get('invitationService').cancel(invitation.uuid);
      dispatch(showSuccess(translate('Invitation has been canceled.')));
    } catch (e) {
      dispatch(showError(translate('Unable to cancel invitation.')));
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
    if (invitation.state !== 'pending') {
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
      return translate("You don't have permission to cancel this invitation.");
    }

    if (invitation.state !== 'pending') {
      return translate('Only pending invitation can be canceled.');
    }
  }, [user, customer, invitation]);

  return (
    <ActionButton
      action={callback}
      title={translate('Cancel')}
      icon="fa fa-ban"
      disabled={isDisabled}
      tooltip={tooltip}
    />
  );
};
