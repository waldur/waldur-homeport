import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { ActionButtonSmall } from '@waldur/table/ActionButtonSmall';

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
    <ActionButtonSmall
      title={translate('Remove')}
      action={action}
      disable={removing}
      className="btn btn-secondary"
    >
      <i className={removing ? 'fa fa-spinner fa-spin' : 'fa fa-trash'} />
    </ActionButtonSmall>
  );
};
