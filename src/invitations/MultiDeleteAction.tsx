import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { userInvitationsDelete } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

export const MultiDeleteAction = ({ rows, refetch }) => {
  const user = useUser();
  const dispatch = useDispatch();

  const callback = () => {
    try {
      Promise.all(
        rows.map((row) => userInvitationsDelete({ path: { uuid: row.uuid } })),
      ).then(() => {
        refetch();
        dispatch(showSuccess(translate('Invitations have been deleted.')));
      });
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
      iconNode={<TrashIcon weight="bold" />}
      disabled={!user.is_staff}
      tooltip={tooltip}
    />
  );
};
