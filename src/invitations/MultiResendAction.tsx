import { ShareIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userInvitationsSend } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer, getProject } from '@/workspace/selectors';

import { InvitationPolicyService } from './actions/InvitationPolicyService';

const statesForResend = ['pending', 'expired', 'canceled'];

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
        'Only pending, expired and canceled invitations can be sent again.',
      );
    }
  }
  return translate('Resend all selected invitations.');
};

export const MultiResendAction = ({ rows, refetch }) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const disabled = useMemo(() => {
    return isAnyDisabled(user, customer, project, rows);
  }, [user, customer, project, rows]);

  const tooltip = useMemo(() => {
    return showTooltip(user, customer, project, rows);
  }, [user, customer, project, rows]);

  const { mutate, isPending } = useBatchMutation<any, void>({
    rows,
    refetch,
    mutationFn: (row) => userInvitationsSend({ path: { uuid: row.uuid } }),
    successMessage: translate('Invitations have been sent again.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} invitations have been sent again.', { n }),
    errorMessage: translate('Unable to resend invitations.'),
    renderErrorMessage: (n) =>
      translate('{n} invitations could not be resent.', { n }),
  });

  return (
    <ActionItem
      title={translate('Resend')}
      action={mutate}
      iconNode={<ShareIcon weight="bold" />}
      disabled={disabled || isPending}
      tooltip={tooltip}
    />
  );
};
