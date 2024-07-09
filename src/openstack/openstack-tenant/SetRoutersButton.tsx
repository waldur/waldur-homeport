import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const SetRoutesDialog = lazyComponent(
  () => import('./SetRoutesDialog'),
  'SetRoutesDialog',
);

export const SetRoutersButton: FunctionComponent<{ router }> = ({ router }) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(SetRoutesDialog, {
        resolve: {
          router,
        },
      }),
    );
  return (
    <RowActionButton
      title={translate('Set static routes')}
      iconNode={<PencilSimple />}
      action={openDialog}
      size="sm"
    />
  );
};
