import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const SetRoutesDialog = lazyComponent(
  () => import(/* webpackChunkName: "SetRoutesDialog" */ './SetRoutesDialog'),
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
    <ActionButton
      title={translate('Set static routes')}
      icon="fa fa-pencil"
      action={openDialog}
    />
  );
};
