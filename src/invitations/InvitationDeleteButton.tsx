import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { userInvitationsDelete } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const InvitationDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await userInvitationsDelete({ path: { uuid: row.uuid } });
      dispatch(showSuccess(translate('Invitation has been deleted.')));
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete invitation.')));
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Delete')}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
