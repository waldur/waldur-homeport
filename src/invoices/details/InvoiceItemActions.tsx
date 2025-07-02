import { useSelector } from 'react-redux';

import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { InvoiceItemCompensation } from './InvoiceItemCompensation';
import { InvoiceItemDelete } from './InvoiceItemDelete';
import { InvoiceItemMove } from './InvoiceItemMove';
import { InvoiceItemUpdate } from './InvoiceItemUpdate';

export const InvoiceItemActions = ({ invoice, item, refreshInvoiceItems }) => {
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }

  return (
    <ActionsDropdownComponent>
      <InvoiceItemUpdate
        item={item}
        refreshInvoiceItems={refreshInvoiceItems}
      />

      <InvoiceItemMove
        invoice={invoice}
        item={item}
        refreshInvoiceItems={refreshInvoiceItems}
      />

      <InvoiceItemCompensation
        item={item}
        refreshInvoiceItems={refreshInvoiceItems}
      />

      <InvoiceItemDelete
        item={item}
        refreshInvoiceItems={refreshInvoiceItems}
      />
    </ActionsDropdownComponent>
  );
};
