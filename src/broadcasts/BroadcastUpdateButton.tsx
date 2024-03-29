import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { BroadcastResponseData } from './types';
import { parseBroadcast } from './utils';

const BroadcastUpdateDialog = lazyComponent(
  () => import('./BroadcastUpdateDialog'),
  'BroadcastUpdateDialog',
);

export const BroadcastUpdateButton: FunctionComponent<{
  broadcast: BroadcastResponseData;
  refetch;
}> = ({ broadcast, refetch }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(BroadcastUpdateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          initialValues: parseBroadcast(broadcast),
          uuid: broadcast.uuid,
          refetch,
        },
        size: 'xl',
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Update')}
      icon="fa fa-edit"
      variant="light"
      className="me-3"
    />
  );
};
