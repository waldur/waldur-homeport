import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const PaymentProfileCreateDialog = lazyComponent(
  () => import('./PaymentProfileCreateDialog'),
  'PaymentProfileCreateDialog',
);

export const PaymentProfileCreateButton = (props) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(PaymentProfileCreateDialog, {
        resolve: {
          refreshList: props.refreshList,
        },
      }),
    );
  return (
    <ActionButton
      title={translate('Add payment profile')}
      action={openDialog}
      icon="fa fa-plus"
      variant="primary"
      {...props}
    />
  );
};
