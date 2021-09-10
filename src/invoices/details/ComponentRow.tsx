import { OverlayTrigger, Popover } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { InvoiceItemActions } from './InvoiceItemActions';
import { ResourceLimitPeriodsTable } from './ResourceLimitPeriodsTable';

import './ComponentRow.scss';

export const ComponentRow = ({
  item,
  showPrice,
  showVat,
  refreshInvoiceItems,
}) => (
  <tr>
    <td>
      <div>
        <strong>{item.details.offering_component_name || item.name}</strong>{' '}
      </div>
      {item.article_code && (
        <div>
          <small>
            {translate('Article code')}: {item.article_code}
          </small>
        </div>
      )}
    </td>
    <td>{item.measured_unit}</td>
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="top"
      overlay={
        <Popover id="InvoiceItem">
          <ResourceLimitPeriodsTable
            periods={item.details.resource_limit_periods}
            unit={item.unit}
          />
        </Popover>
      }
    >
      <td>{item.factor || item.quantity}</td>
    </OverlayTrigger>
    {showPrice && (
      <>
        <td>{defaultCurrency(item.unit_price)}</td>
        {showVat && <td>{defaultCurrency(item.tax)}</td>}
        <td>{defaultCurrency(showVat ? item.total : item.price)}</td>
      </>
    )}
    <td>
      <InvoiceItemActions
        item={item}
        refreshInvoiceItems={refreshInvoiceItems}
      />
    </td>
  </tr>
);
