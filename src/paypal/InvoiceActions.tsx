import * as React from 'react';
import * as Dropdown from 'react-bootstrap/lib/Dropdown';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const InvoiceActions = ({ invoice }) =>
  invoice.backend_id ? (
    <Dropdown id="InvoiceActions">
      <Dropdown.Toggle className="btn-sm">
        {translate('Actions')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {invoice.pdf ? (
          <MenuItem>
            <a
              download={`invoice-${invoice.number}.pdf`}
              href={invoice.pdf}
              target="_self"
            >
              <i className="fa fa-download"></i> {translate('Download invoice')}
            </a>
          </MenuItem>
        ) : null}
        <MenuItem>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={invoice.payment_url}
          >
            <i className="fa fa-paypal"></i> {translate('Pay invoice')}
          </a>
        </MenuItem>
      </Dropdown.Menu>
    </Dropdown>
  ) : (
    <Tooltip
      label={translate('Invoice has not been sent to PayPal yet')}
      id="paypal-tooltip"
    >
      N/A
    </Tooltip>
  );
