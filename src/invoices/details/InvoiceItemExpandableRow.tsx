import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { PriceTooltip } from '@/price/PriceTooltip';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { Invoice, InvoiceItem, InvoiceTableItem } from '../types';

import { InvoiceItemActions } from './InvoiceItemActions';
import { ResourceLimitPeriodsTable } from './ResourceLimitPeriodsTable';

// Volume-discount and credit-compensation metadata is written into the
// free-form invoice item details blob by the billing pipeline and is not part
// of the generated SDK type.
interface AdjustmentItemDetails {
  is_discount?: boolean;
  discount_type?: string;
  discount_formula?: string;
  discount_percent?: number;
  aggregated_usage?: number;
  offering_component_type?: string;
  offering_component_name?: string;
  discount_of_item?: string;
  is_compensation?: boolean;
  compensation_of_item?: string;
}

interface OwnProps {
  row: InvoiceTableItem;
  invoice: Invoice;
  items: InvoiceItem[];
  showPrice?: boolean;
  showVat?: boolean;
  filterCompensationItems?: boolean;
  refresh;
}

const getDetails = (it: InvoiceItem) =>
  (it.details ?? {}) as AdjustmentItemDetails;

// An "adjustment" is a volume discount or a credit compensation — a system-
// generated line that reduces a specific component item.
const isAdjustmentItem = (it: InvoiceItem) => {
  const d = getDetails(it);
  return Boolean(d.is_discount || d.is_compensation || it.credit);
};

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

export const InvoiceItemExpandableRow: FC<OwnProps> = (props) => {
  const orderedItems = orderItemsWithAdjustments(props.items);
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
              {orderedItems.map((item, i) => {
                const dd = getDetails(item);
                const isDiscount = Boolean(dd.is_discount);
                const isCompensation =
                  !isDiscount && Boolean(dd.is_compensation || item.credit);
                const isAdjustment = isDiscount || isCompensation;
                const componentLabel =
                  dd.offering_component_name || dd.offering_component_type;
                return (
                  <tr
                    key={i}
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
                            <Popover
                              id={'InvoiceDiscount-' + item.uuid}
                              className="p-4"
                            >
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
                        <td className={isDiscount ? 'text-success' : undefined}>
                          {defaultCurrency(item.unit_price)}
                        </td>
                        {props.showVat && <td>{defaultCurrency(item.tax)}</td>}
                        <td className={isDiscount ? 'text-success' : undefined}>
                          {defaultCurrency(
                            props.showVat ? item.total : item.price,
                          )}
                        </td>
                      </>
                    )}
                    <td>
                      {!isAdjustment && (
                        <InvoiceItemActions
                          invoice={props.invoice}
                          item={item}
                          refreshInvoiceItems={props.refresh}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ExpandableContainer>
  );
};
