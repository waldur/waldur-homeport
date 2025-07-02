import { PlusCircleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const InvoiceItemCompensationDialog = lazyComponent(() =>
  import('./InvoiceItemCompensationDialog').then((module) => ({
    default: module.InvoiceItemCompensationDialog,
  })),
);

export const InvoiceItemCompensation = ({ item, refreshInvoiceItems }) => (
  <DialogActionItem
    title={translate('Create compensation')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={InvoiceItemCompensationDialog}
    resource={item}
    extraResolve={{ refreshInvoiceItems }}
  />
);
