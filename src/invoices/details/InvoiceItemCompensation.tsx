import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const InvoiceItemCompensationDialog = lazyComponent(
  () => import('./InvoiceItemCompensationDialog'),
  'InvoiceItemCompensationDialog',
);

export const InvoiceItemCompensation = ({ item, refreshInvoiceItems }) => (
  <DialogActionItem
    title={translate('Create compensation')}
    icon="fa fa-plus"
    modalComponent={InvoiceItemCompensationDialog}
    resource={item}
    extraResolve={{ refreshInvoiceItems }}
  />
);
