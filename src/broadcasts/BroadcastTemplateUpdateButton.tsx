import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const BroadcastTemplateUpdateDialog = lazyComponent(
  () => import('./BroadcastTemplateUpdateDialog'),
  'BroadcastTemplateUpdateDialog',
);

export const BroadcastTemplateUpdateButton: FunctionComponent<{
  template;
  refetch;
}> = ({ template, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(BroadcastTemplateUpdateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: { template, refetch },
        size: 'lg',
      }),
    );
  };
  return <EditButton onClick={callback} size="sm" />;
};
