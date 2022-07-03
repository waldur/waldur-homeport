import { Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
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
    <Dropdown id="invoice-item-actions" pullRight>
      <DropdownToggle className="btn-sm">{translate('Actions')}</DropdownToggle>
      <DropdownMenu>
        <InvoiceItemCompensation
          item={item}
          refreshInvoiceItems={refreshInvoiceItems}
        />
        <InvoiceItemUpdate
          item={item}
          refreshInvoiceItems={refreshInvoiceItems}
        />
        <InvoiceItemMove
          invoice={invoice}
          item={item}
          refreshInvoiceItems={refreshInvoiceItems}
        />
        <InvoiceItemDelete
          item={item}
          refreshInvoiceItems={refreshInvoiceItems}
        />
      </DropdownMenu>
    </Dropdown>
  );
};
