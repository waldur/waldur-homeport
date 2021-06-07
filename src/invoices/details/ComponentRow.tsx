import { FC } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { InvoiceItem } from '../types';

import { ResourceLimitPeriodsTable } from './ResourceLimitPeriodsTable';
import './ComponentRow.scss';
import { getBillingPeriodTitle } from './utils';

interface ComponentRowProps {
  item: InvoiceItem;
  showPrice: boolean;
  showVat: boolean;
}

export const ComponentRow: FC<ComponentRowProps> = ({
  item,
  showPrice,
  showVat,
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
    <td>
      {item.unit === 'quantity'
        ? item.measured_unit
        : `${item.measured_unit}*${getBillingPeriodTitle(item.unit)}`}
    </td>
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
  </tr>
);
