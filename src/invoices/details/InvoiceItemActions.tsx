import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { InvoiceItemCompensation } from './InvoiceItemCompensation';
import { InvoiceItemDelete } from './InvoiceItemDelete';
import { InvoiceItemMove } from './InvoiceItemMove';
import { InvoiceItemUpdate } from './InvoiceItemUpdate';

export const InvoiceItemActions = ({ item, refreshInvoiceItems }) => {
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }

  return (
    <Dropdown id="invoice-item-actions" align="start">
      <Dropdown.Toggle className="btn-sm">
        {translate('Actions')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <InvoiceItemUpdate
          item={item}
          refreshInvoiceItems={refreshInvoiceItems}
        />
        <InvoiceItemMove
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
      </Dropdown.Menu>
    </Dropdown>
  );
};
