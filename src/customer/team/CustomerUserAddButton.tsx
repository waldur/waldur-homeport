import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CustomerUserAddDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerUserAddDialog" */ './CustomerUserAddDialog'
    ),
  'CustomerUserAddDialog',
);

interface CustomerUserAddButtonProps {
  refreshList;
}

export const CustomerUserAddButton: FunctionComponent<CustomerUserAddButtonProps> =
  ({ refreshList }) => {
    const dispatch = useDispatch();
    const callback = () =>
      dispatch(
        openModalDialog(CustomerUserAddDialog, { resolve: { refreshList } }),
      );

    return (
      <ActionButton
        action={callback}
        title={translate('Add owner')}
        icon="fa fa-plus"
        variant="primary"
      />
    );
  };
