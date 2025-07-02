import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { broadcastMessagesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const BroadcastDeleteButton: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete broadcast'),
        translate(
          'Are you sure you would like to delete broadcast {broadcast}?',
          { broadcast: <strong>{row.subject}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await broadcastMessagesDestroy({ path: { uuid: row.uuid } });
      await refetch();
      dispatch(showSuccess(translate('Broadcast has been deleted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete broadcast.')));
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
