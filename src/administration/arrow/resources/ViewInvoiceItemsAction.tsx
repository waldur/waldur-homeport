import { ReceiptIcon } from '@phosphor-icons/react';
import type { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { DropdownActionItemType } from '@/table/types';

const ViewInvoiceItemsDialog = lazyComponent(() =>
  import('./ViewInvoiceItemsDialog').then((module) => ({
    default: module.ViewInvoiceItemsDialog,
  })),
);

export const ViewInvoiceItemsAction: DropdownActionItemType<Resource> = ({
  row,
}) => (
  <DialogActionItem
    title={translate('View invoice items')}
    modalComponent={ViewInvoiceItemsDialog}
    resource={row}
    dialogSize="xl"
    iconNode={<ReceiptIcon weight="bold" />}
  />
);
