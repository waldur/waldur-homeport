import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';

const InvoiceItemUpdateDialog = lazyComponent(() =>
  import('./InvoiceItemUpdateDialog').then((module) => ({
    default: module.InvoiceItemUpdateDialog,
  })),
);

export const InvoiceItemUpdate = ({ item, refreshInvoiceItems }) => (
  <DialogActionItem
    title={translate('Edit item')}
    iconNode={<PencilSimpleIcon weight="bold" />}
    modalComponent={InvoiceItemUpdateDialog}
    resource={item}
    extraResolve={{ refreshInvoiceItems }}
  />
);
