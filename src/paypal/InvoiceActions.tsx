import React from 'react';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import DropdownMenu from 'react-bootstrap/lib/DropdownMenu';
import DropdownToggle from 'react-bootstrap/lib/DropdownToggle';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const InvoiceActions = ({ invoice }) =>
  invoice.backend_id ? (
    <Dropdown id="InvoiceActions">
      <DropdownToggle className="btn-sm">{translate('Actions')}</DropdownToggle>
      <DropdownMenu>
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
      </DropdownMenu>
    </Dropdown>
  ) : (
    <Tooltip
      label={translate('Invoice has not been sent to PayPal yet')}
      id="paypal-tooltip"
    >
      N/A
    </Tooltip>
  );
