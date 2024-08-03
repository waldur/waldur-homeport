import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { InvitationService } from './InvitationService';

export const InvitationDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await InvitationService.delete(row.uuid);
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
      iconNode={<Trash />}
    />
  );
};
