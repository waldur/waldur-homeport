import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      iconNode={<PencilSimple />}
    />
  );
};
