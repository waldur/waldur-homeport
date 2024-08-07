import { PencilSimple } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ConfigurationEditDialog = lazyComponent(
  () => import('./ConfigurationEditDialog'),
  'ConfigurationEditDialog',
);

export const ConfigurationEditButton = ({ item }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ConfigurationEditDialog, {
          resolve: { item },
          initialValues: { value: ENV.plugins.WALDUR_CORE[item.key] },
          size: 'md',
        }),
      ),
    [dispatch],
  );

  return (
    <ActionButton
      action={openFormDialog}
      iconNode={<PencilSimple />}
      size="sm"
      variant="secondary"
      className="btn-icon"
    />
  );
};