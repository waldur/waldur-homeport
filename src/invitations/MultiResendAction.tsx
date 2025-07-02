import { ShareIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userInvitationsSend } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

import { InvitationPolicyService } from './actions/InvitationPolicyService';

const statesForResend = ['pending', 'expired'];

const isAnyDisabled = (user, customer, project, rows) => {
  return rows.some((invitation) => {
    return (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        invitation,
      ) || statesForResend.indexOf(invitation.state) === -1
    );
  });
};

const showTooltip = (user, customer, project, rows) => {
  let hasPermission = true;
  let hasAvailableState = true;

  for (const invitation of rows) {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        invitation,
      )
    ) {
      hasPermission = false;
    } else if (statesForResend.indexOf(invitation.state) === -1) {
      hasAvailableState = false;
    }
    if (!hasPermission) {
      return translate("You don't have permission to send this invitation.");
    }
    if (!hasAvailableState) {
      return translate(
        'Only pending and expired invitations can be sent again.',
      );
    }
  }
  return translate('Resend all selected invitations.');
};

export const MultiResendAction = ({ rows, refetch }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const dispatch = useDispatch();

  const disabled = useMemo(() => {
    return isAnyDisabled(user, customer, project, rows);
  }, [user, customer, project, rows]);

  const tooltip = useMemo(() => {
    return showTooltip(user, customer, project, rows);
  }, [user, customer, project, rows]);

  const callback = () => {
    try {
      Promise.all(
        rows.map((row) => userInvitationsSend({ path: { uuid: row.uuid } })),
      ).then(() => {
        refetch();
        dispatch(showSuccess(translate('Invitations have been sent again.')));
      });
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to resend invitations.')),
      );
    }
  };

  return (
    <ActionItem
      title={translate('Resend')}
      action={callback}
      iconNode={<ShareIcon weight="bold" />}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
