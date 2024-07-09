import { Trash } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

import { removeHook } from './api';

const HookRemoveDialog = lazyComponent(
  () => import('./HookRemoveDialog'),
  'HookRemoveDialog',
);

interface HookRemoveButtonProps {
  refetch();
  url: string;
}

export const HookRemoveButton: FC<HookRemoveButtonProps> = (props) => {
  const [removing, setRemoving] = useState(false);
  const dispatch = useDispatch();

  const action = () =>
    dispatch(
      openModalDialog(HookRemoveDialog, {
        resolve: {
          action: async () => {
            try {
              setRemoving(true);
              await removeHook(props.url);
              await props.refetch();
              dispatch(showSuccess(translate('Hook has been removed.')));
            } catch (e) {
              dispatch(showError(translate('Unable to remove hook.')));
            }
          },
        },
        size: 'md',
      }),
    );

  return (
    <RowActionButton
      title={translate('Remove')}
      action={action}
      pending={removing}
      iconNode={<Trash />}
      size="sm"
    />
  );
};
