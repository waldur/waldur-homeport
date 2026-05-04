import { ProhibitIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Invitation, userInvitationsCancel } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer, getProject } from '@/workspace/selectors';

import { InvitationPolicyService } from './actions/InvitationPolicyService';

const isAnyDisabled = (user, customer, project, rows) => {
  return rows.some((invitation) => {
    return (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        invitation,
      ) ||
      (invitation.state !== 'pending' && invitation.state !== 'project')
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
    } else if (
      invitation.state !== 'pending' &&
      invitation.state !== 'project'
    ) {
      hasAvailableState = false;
    }
    if (!hasPermission) {
      return translate(
        "You don't have permission to cancel these invitations.",
      );
    }
    if (!hasAvailableState) {
      return translate('Only pending or planned invitations can be canceled.');
    }
  }
  return translate('Cancel all selected invitations.');
};

export const MultiCancelAction = ({ rows, refetch }) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const disabled = useMemo(() => {
    return isAnyDisabled(user, customer, project, rows);
  }, [user, customer, project, rows]);

  const tooltip = useMemo(() => {
    return showTooltip(user, customer, project, rows);
  }, [user, customer, project, rows]);

  const { mutate, isPending } = useBatchMutation<Invitation, void>({
    rows,
    refetch,
    mutationFn: (row) => userInvitationsCancel({ path: { uuid: row.uuid } }),
    successMessage: translate('Invitations have been cancelled.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} invitations have been cancelled.', { n }),
    errorMessage: translate('Unable to cancel invitations.'),
    renderErrorMessage: (n) =>
      translate('{n} invitations could not be cancelled.', { n }),
    confirmation: {
      title: translate('Cancel invitations'),
      body: translate('Are you sure you want to cancel {count} invitations?', {
        count: rows.length,
      }),
    },
  });

  return (
    <ActionItem
      title={translate('Cancel')}
      action={mutate}
      iconNode={<ProhibitIcon weight="bold" />}
      disabled={disabled || isPending}
      tooltip={tooltip}
    />
  );
};
