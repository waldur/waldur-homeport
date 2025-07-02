import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { Invoice, InvoiceItem, InvoiceTableItem } from '../types';

import { InvoiceItemActions } from './InvoiceItemActions';
import { ResourceLimitPeriodsTable } from './ResourceLimitPeriodsTable';

interface OwnProps {
  row: InvoiceTableItem;
  invoice: Invoice;
  items: InvoiceItem[];
  showPrice?: boolean;
  showVat?: boolean;
  filterCompensationItems?: boolean;
  refresh;
}

export const InvoiceItemExpandableRow: FC<OwnProps> = (props) => {
  return (
    <ExpandableContainer>
      <div className="card card-table card-bordered">
        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr className="align-middle">
                <th>{translate('Name')}</th>
                <th>{translate('Unit')}</th>
                <th>{translate('Quantity')}</th>
                {props.showPrice && (
                  <>
                    <th>{translate('Unit price')}</th>
                    {props.showVat && <th>{translate('Tax')}</th>}
                    <th>
                      {translate('Total')}
                      <PriceTooltip />
                    </th>
                  </>
                )}
                <th className="w-150px">{translate('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {props.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    {item.credit && translate('Credit compensation.')}{' '}
                    {item.details.offering_component_name}
                    {item.article_code && (
                      <small className="d-block">
                        {translate('Article code')}: {item.article_code}
                      </small>
                    )}
                  </td>
                  <td>{item.measured_unit}</td>
                  {item.details.resource_limit_periods ? (
                    <OverlayTrigger
                      trigger={['hover', 'focus']}
                      placement="top"
                      overlay={
                        <Popover
                          id={'InvoiceItem-' + item.uuid}
                          className="p-4"
                        >
                          <ResourceLimitPeriodsTable
                            periods={item.details.resource_limit_periods}
                            unit={item.unit}
                          />
                        </Popover>
                      }
                    >
                      <td>
                        {Number(item.factor || item.quantity)}{' '}
                        <WarningCircleIcon
                          weight="bold"
                          size={16}
                          className="text-gray-400"
                        />
                      </td>
                    </OverlayTrigger>
                  ) : (
                    <td>{Number(item.factor || item.quantity)}</td>
                  )}
                  {props.showPrice && (
                    <>
                      <td>{defaultCurrency(item.unit_price)}</td>
                      {props.showVat && <td>{defaultCurrency(item.tax)}</td>}
                      <td>
                        {defaultCurrency(
                          props.showVat ? item.total : item.price,
                        )}
                      </td>
                    </>
                  )}
                  <td>
                    <InvoiceItemActions
                      invoice={props.invoice}
                      item={item}
                      refreshInvoiceItems={props.refresh}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ExpandableContainer>
  );
};
