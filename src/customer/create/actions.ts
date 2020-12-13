import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const CustomerCreateDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerCreateDialog" */ './CustomerCreateDialog'
    ),
  'CustomerCreateDialog',
);

export const customerCreateDialog = (resolve?) =>
  openModalDialog(CustomerCreateDialog, {
    size: 'lg',
    resolve: { role: 'CUSTOMER', ...resolve },
  });
