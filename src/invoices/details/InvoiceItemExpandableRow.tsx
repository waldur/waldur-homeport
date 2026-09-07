import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, Fragment } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { PriceTooltip } from '@/price/PriceTooltip';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { Invoice, InvoiceItem, InvoiceTableItem } from '../types';

import { InvoiceItemActions } from './InvoiceItemActions';
import { ResourceLimitPeriodsTable } from './ResourceLimitPeriodsTable';
import {
  getDetails,
  groupItemsByPlan,
  InvoicePlanGroup,
  isAdjustmentItem,
} from './utils';

interface OwnProps {
  row: InvoiceTableItem;
  invoice: Invoice;
  items: InvoiceItem[];
  showPrice?: boolean;
  showVat?: boolean;
  filterCompensationItems?: boolean;
  refresh;
}

// Recurring items are priced per billing period; say so next to the unit,
// so "cores / month" and "core-hours" read differently on the same invoice.
const getBillingUnitSuffix = (unit: string): string =>
  ({
    month: translate('/ month'),
    half_month: translate('/ half month'),
    day: translate('/ day'),
    hour: translate('/ hour'),
    quarter: translate('/ quarter'),
  })[unit] || '';

// Place each adjustment line immediately after the component item it applies to
// (matched via details.discount_of_item / compensation_of_item), so the pairing
// is clear instead of listing adjustments loosely at the bottom.
const orderItemsWithAdjustments = (items: InvoiceItem[]): InvoiceItem[] => {
  const mains = items.filter((it) => !isAdjustmentItem(it));
  const adjustments = items.filter(isAdjustmentItem);
  const byTarget = new Map<string, InvoiceItem[]>();
  for (const a of adjustments) {
    const d = getDetails(a);
    const key = d.discount_of_item ?? d.compensation_of_item;
    if (!key) continue;
    const list = byTarget.get(key) ?? [];
    list.push(a);
    byTarget.set(key, list);
  }
  const ordered: InvoiceItem[] = [];
  const paired = new Set<InvoiceItem>();
  for (const main of mains) {
    ordered.push(main);
    for (const a of byTarget.get(main.uuid) ?? []) {
      ordered.push(a);
      paired.add(a);
    }
  }
  // Adjustments without a matching main item (older data) go at the end.
  for (const a of adjustments) {
    if (!paired.has(a)) ordered.push(a);
  }
  return ordered;
};

const InvoiceItemLine: FC<{
  item: InvoiceItem;
  invoice: Invoice;
  showPrice?: boolean;
  showVat?: boolean;
  refresh;
}> = ({ item, invoice, showPrice, showVat, refresh }) => {
  const dd = getDetails(item);
  const isDiscount = Boolean(dd.is_discount);
  const isCompensation =
    !isDiscount && Boolean(dd.is_compensation || item.credit);
  const isAdjustment = isDiscount || isCompensation;
  const componentLabel =
    dd.offering_component_name || dd.offering_component_type;
  return (
    <tr
      className={
        isDiscount
          ? 'bg-light-success'
          : isCompensation
            ? 'bg-light'
            : undefined
      }
    >
      <td>
        {isDiscount ? (
          <OverlayTrigger
            trigger={['hover', 'focus']}
            placement="top"
            overlay={
              <Popover id={'InvoiceDiscount-' + item.uuid} className="p-4">
                <div className="mb-1 fw-bold">
                  {translate('Volume discount')}
                  {componentLabel ? ` — ${componentLabel}` : ''}
                  {dd.discount_percent != null
                    ? ` (${dd.discount_percent}%)`
                    : ''}
                </div>
                {dd.aggregated_usage != null && (
                  <div className="text-muted">
                    {translate('Organization-aggregated usage')}:{' '}
                    {dd.aggregated_usage}
                  </div>
                )}
                {dd.discount_formula && (
                  <div className="text-muted">
                    {translate('Formula')}: {dd.discount_formula}
                  </div>
                )}
              </Popover>
            }
          >
            <span className="text-success ps-5">
              ↳ {translate('Volume discount')}
              {componentLabel ? ` — ${componentLabel}` : ''}
              {dd.discount_percent != null
                ? ` (${dd.discount_percent}%)`
                : ''}{' '}
              <WarningCircleIcon
                weight="bold"
                size={16}
                className="text-gray-400"
              />
            </span>
          </OverlayTrigger>
        ) : isCompensation ? (
          <span className="text-muted ps-5">
            ↳ {translate('Credit compensation')}
            {componentLabel ? ` — ${componentLabel}` : ''}
          </span>
        ) : (
          <>
            {item.details.offering_component_name}
            {item.article_code && (
              <small className="d-block">
                {translate('Article code')}: {item.article_code}
              </small>
            )}
          </>
        )}
      </td>
      <td className="text-nowrap">
        {isAdjustment
          ? null
          : `${formatDate(item.start)} – ${formatDate(item.end)}`}
      </td>
      <td className="text-nowrap">
        {item.measured_unit}
        {getBillingUnitSuffix(item.unit) && (
          <span className="text-muted"> {getBillingUnitSuffix(item.unit)}</span>
        )}
      </td>
      {item.details.resource_limit_periods ? (
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="top"
          overlay={
            <Popover id={'InvoiceItem-' + item.uuid} className="p-4">
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
      {showPrice && (
        <>
          <td className={isDiscount ? 'text-success' : undefined}>
            {defaultCurrency(item.unit_price)}
          </td>
          {showVat && <td>{defaultCurrency(item.tax)}</td>}
          <td className={isDiscount ? 'text-success' : undefined}>
            {defaultCurrency(showVat ? item.total : item.price)}
          </td>
        </>
      )}
      <td>
        {!isAdjustment && (
          <InvoiceItemActions
            invoice={invoice}
            item={item}
            refreshInvoiceItems={refresh}
          />
        )}
      </td>
    </tr>
  );
};

export const InvoiceItemExpandableRow: FC<OwnProps> = (props) => {
  const orderedItems = orderItemsWithAdjustments(props.items);
  // A resource billed by more than one plan this month reads best as one
  // block per plan, each with its own period and subtotal.
  const planGroups = props.row.hasPlanChange
    ? groupItemsByPlan(orderedItems)
    : null;
  // Name, period, unit, quantity, [unit price, [tax], total], actions.
  const columnCount =
    4 + (props.showPrice ? 2 + (props.showVat ? 1 : 0) : 0) + 1;

  const renderPlanHeader = (group: InvoicePlanGroup) => (
    <tr className="bg-light">
      <td colSpan={props.showPrice ? columnCount - 2 : columnCount}>
        <span className="fw-bold">{translate('Plan')}: </span>
        {group.plan_name || translate('No plan')}
        {group.start && group.end && (
          <span className="text-muted ms-3">
            {formatDate(group.start)} – {formatDate(group.end)}
          </span>
        )}
      </td>
      {props.showPrice && (
        <>
          <td className="fw-bold">
            {defaultCurrency(props.showVat ? group.total : group.price)}
          </td>
          <td />
        </>
      )}
    </tr>
  );

  const renderItem = (item: InvoiceItem, key: string | number) => (
    <InvoiceItemLine
      key={key}
      item={item}
      invoice={props.invoice}
      showPrice={props.showPrice}
      showVat={props.showVat}
      refresh={props.refresh}
    />
  );

  return (
    <ExpandableContainer>
      <div className="card card-table card-bordered">
        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr className="align-middle">
                <th>{translate('Name')}</th>
                <th>{translate('Period')}</th>
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
              {planGroups
                ? planGroups.map((group) => (
                    <Fragment key={group.plan_name}>
                      {renderPlanHeader(group)}
                      {group.items.map((item, i) =>
                        renderItem(item, `${group.plan_name}-${i}`),
                      )}
                    </Fragment>
                  ))
                : orderedItems.map((item, i) => renderItem(item, i))}
            </tbody>
          </table>
        </div>
      </div>
    </ExpandableContainer>
  );
};
