import { Prohibit } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

import { InvitationPolicyService } from './actions/InvitationPolicyService';
import { InvitationService } from './InvitationService';

const isAnyDisabled = (user, customer, project, rows) => {
  return rows.some((invitation) => {
    return (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        invitation,
      ) || invitation.state !== 'pending'
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
    } else if (invitation.state !== 'pending') {
      hasAvailableState = false;
    }
    if (!hasPermission) {
      return translate(
        "You don't have permission to cancel these invitations.",
      );
    }
    if (!hasAvailableState) {
      return translate('Only pending invitations can be canceled.');
    }
  }
  return translate('Cancel all selected invitations.');
};

export const MultiCancelAction = ({ rows, refetch }) => {
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
      Promise.all(rows.map((row) => InvitationService.cancel(row.uuid))).then(
        () => {
          refetch();
          dispatch(showSuccess(translate('Invitations have been cancelled.')));
        },
      );
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to cancel invitations.')),
      );
    }
  };

  return (
    <ActionItem
      title={translate('Cancel')}
      action={callback}
      iconNode={<Prohibit />}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
