import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const InvoiceActions: FunctionComponent<{ invoice }> = ({ invoice }) =>
  invoice.backend_id ? (
    <Dropdown id="InvoiceActions">
      <Dropdown.Toggle className="btn-sm">
        {translate('Actions')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {invoice.pdf ? (
          <Dropdown.Item>
            <a
              download={`invoice-${invoice.number}.pdf`}
              href={invoice.pdf}
              target="_self"
            >
              <i className="fa fa-download"></i> {translate('Download invoice')}
            </a>
          </Dropdown.Item>
        ) : null}
        <Dropdown.Item>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={invoice.payment_url}
          >
            <i className="fa fa-paypal"></i> {translate('Pay invoice')}
          </a>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  ) : (
    <Tip
      label={translate('Invoice has not been sent to PayPal yet')}
      id="paypal-tooltip"
    >
      N/A
    </Tip>
  );
