import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, Fragment } from 'react';

import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
} from 'waldur-ui';

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
    <TableRow
      className={
        isDiscount
          ? 'bg-success-subtle'
          : isCompensation
            ? 'bg-tertiary dark:bg-quaternary'
            : undefined
      }
    >
      <TableCell>
        {isDiscount ? (
          <Tooltip
            autoWidth={true}
            label={
              <>
                <div className="mb-1 font-medium">
                  {translate('Volume discount')}
                  {componentLabel ? ` — ${componentLabel}` : ''}
                  {dd.discount_percent != null
                    ? ` (${dd.discount_percent}%)`
                    : ''}
                </div>
                {dd.is_estimate && (
                  <div className="mb-1 text-quaternary">
                    {translate(
                      'Estimated on the usage so far. The final discount is set when the invoice is closed.',
                    )}
                  </div>
                )}
                {dd.aggregated_usage != null && (
                  <div className="text-quaternary">
                    {translate('Organization-aggregated usage')}:{' '}
                    {dd.aggregated_usage}
                  </div>
                )}
                {dd.discount_formula && (
                  <div className="text-quaternary">
                    {translate('Formula')}: {dd.discount_formula}
                  </div>
                )}
              </>
            }
          >
            <span className="text-success ps-4">
              ↳ {translate('Volume discount')}
              {componentLabel ? ` — ${componentLabel}` : ''}
              {dd.discount_percent != null ? ` (${dd.discount_percent}%)` : ''}
              {dd.is_estimate ? `, ${translate('estimated')}` : ''}{' '}
              <WarningCircleIcon
                weight="bold"
                size={16}
                className="text-quinary"
              />
            </span>
          </Tooltip>
        ) : isCompensation ? (
          <span className="text-quaternary ps-4">
            ↳ {translate('Credit compensation')}
            {componentLabel ? ` — ${componentLabel}` : ''}
          </span>
        ) : (
          <>
            {item.details.offering_component_name}
            {item.article_code && (
              <small className="block">
                {translate('Article code')}: {item.article_code}
              </small>
            )}
          </>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {isAdjustment
          ? null
          : `${formatDate(item.start)} – ${formatDate(item.end)}`}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {item.measured_unit}
        {getBillingUnitSuffix(item.unit) && (
          <span className="text-quaternary">
            {' '}
            {getBillingUnitSuffix(item.unit)}
          </span>
        )}
      </TableCell>
      {item.details.resource_limit_periods ? (
        <Tooltip
          autoWidth={true}
          label={
            <ResourceLimitPeriodsTable
              periods={item.details.resource_limit_periods}
              unit={item.unit}
            />
          }
        >
          <TableCell>
            {Number(item.factor || item.quantity)}{' '}
            <WarningCircleIcon
              weight="bold"
              size={16}
              className="text-quinary"
            />
          </TableCell>
        </Tooltip>
      ) : (
        <TableCell>{Number(item.factor || item.quantity)}</TableCell>
      )}
      {showPrice && (
        <>
          <TableCell className={isDiscount ? 'text-success' : undefined}>
            {defaultCurrency(item.unit_price)}
          </TableCell>
          {showVat && <TableCell>{defaultCurrency(item.tax)}</TableCell>}
          <TableCell className={isDiscount ? 'text-success' : undefined}>
            {defaultCurrency(showVat ? item.total : item.price)}
          </TableCell>
        </>
      )}
      <TableCell>
        {!isAdjustment && (
          <InvoiceItemActions
            invoice={invoice}
            item={item}
            refreshInvoiceItems={refresh}
          />
        )}
      </TableCell>
    </TableRow>
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
    <TableRow className="bg-tertiary dark:bg-quaternary" hoverable={false}>
      <TableCell colSpan={props.showPrice ? columnCount - 2 : columnCount}>
        <span className="font-medium">{translate('Plan')}: </span>
        {group.plan_name || translate('No plan')}
        {group.start && group.end && (
          <span className="text-quaternary ms-2.5">
            {formatDate(group.start)} – {formatDate(group.end)}
          </span>
        )}
      </TableCell>
      {props.showPrice && (
        <>
          <TableCell className="font-medium">
            {defaultCurrency(props.showVat ? group.total : group.price)}
          </TableCell>
          <TableCell />
        </>
      )}
    </TableRow>
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
      <Card variant="table" bordered>
        <CardContent>
          <Table className="align-middle">
            <TableHeader>
              <TableRow className="align-middle">
                <TableHead>{translate('Name')}</TableHead>
                <TableHead>{translate('Period')}</TableHead>
                <TableHead>{translate('Unit')}</TableHead>
                <TableHead>{translate('Quantity')}</TableHead>
                {props.showPrice && (
                  <>
                    <TableHead>{translate('Unit price')}</TableHead>
                    {props.showVat && <TableHead>{translate('Tax')}</TableHead>}
                    <TableHead>
                      {translate('Total')}
                      <PriceTooltip />
                    </TableHead>
                  </>
                )}
                <TableHead className="w-[150px]">
                  {translate('Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ExpandableContainer>
  );
};
