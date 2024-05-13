import { Swap } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const InvoiceItemMoveDialog = lazyComponent(
  () => import('./InvoiceItemMoveDialog'),
  'InvoiceItemMoveDialog',
);

export const InvoiceItemMove = ({ invoice, item, refreshInvoiceItems }) => (
  <DialogActionItem
    title={translate('Move item')}
    iconNode={<Swap />}
    modalComponent={InvoiceItemMoveDialog}
    resource={item}
    extraResolve={{ invoice, refreshInvoiceItems }}
  />
);
