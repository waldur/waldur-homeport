import { SwapIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';

const InvoiceItemMoveDialog = lazyComponent(() =>
  import('./InvoiceItemMoveDialog').then((module) => ({
    default: module.InvoiceItemMoveDialog,
  })),
);

export const InvoiceItemMove = ({ invoice, item, refreshInvoiceItems }) => (
  <DialogActionItem
    title={translate('Move item')}
    iconNode={<SwapIcon weight="bold" />}
    modalComponent={InvoiceItemMoveDialog}
    resource={item}
    extraResolve={{ invoice, refreshInvoiceItems }}
  />
);
