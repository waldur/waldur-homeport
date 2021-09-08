import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';
import { getUser } from '@waldur/workspace/selectors';

const AddInvoiceItemDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AddInvoiceItemDialog" */ './AddInvoiceItemDialog'
    ),
  'AddInvoiceItemDialog',
);

export const AddInvoiceItemButton: FunctionComponent<{ invoice }> = ({
  invoice,
}) => {
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }
  return (
    <DialogActionButton
      title={translate('Add invoice item')}
      icon="fa fa-plus"
      className="btn btn-primary"
      modalComponent={AddInvoiceItemDialog}
      resource={invoice}
    />
  );
};
