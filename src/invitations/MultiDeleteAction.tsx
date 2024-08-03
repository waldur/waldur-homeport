import { Trash } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { InvitationService } from './InvitationService';

export const MultiDeleteAction = ({ rows, refetch }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();

  const callback = () => {
    try {
      Promise.all(rows.map((row) => InvitationService.delete(row.uuid))).then(
        () => {
          refetch();
          dispatch(showSuccess(translate('Invitations have been deleted.')));
        },
      );
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete invitations.')),
      );
    }
  };

  const tooltip = user.is_staff
    ? translate('Delete all selected invitations.')
    : translate('You do not have permission to delete invitations.');

  return (
    <ActionItem
      title={translate('Delete')}
      action={callback}
      iconNode={<Trash />}
      disabled={!user.is_staff}
      tooltip={tooltip}
    />
  );
};
