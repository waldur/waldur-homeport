import { InfoIcon } from '@phosphor-icons/react';
import { FC, useEffect, useMemo, useRef } from 'react';
import { OfferingComponent, ProviderPlanDetails } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import {
  BillingTypeBadge,
  formatComponentCharge,
  isChargedOnPlanAmount,
} from '@/marketplace/common/billingTypes';
import { parseFloatOrNull } from '@/marketplace/common/utils';
import {
  EffectiveComponent,
  resolvePlanComponents,
} from '@/marketplace/details/plan/effectiveComponents';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

interface OwnProps {
  row: ProviderPlanDetails;
  components: OfferingComponent[];
}

// A plan amount or price of 0 is a real value the provider needs to see, so it
// must not be collapsed into a dash the way renderFieldOrDash would.
const renderNumberOrDash = (value: number | null | undefined) =>
  value === null || value === undefined ? DASH_ESCAPE_CODE : value;

// Only a plan-amount component has a meaningful amount here; for the rest the
// quantity comes from usage or the customer's limit, and a stored 0 would read
// as "none of it is billed".
const getAmount = (plan: ProviderPlanDetails, component: EffectiveComponent) =>
  isChargedOnPlanAmount(component) ? plan.quotas?.[component.type] : null;

const getColumns = (
  plan: ProviderPlanDetails,
): Column<EffectiveComponent>[] => [
  {
    title: translate('Name'),
    render: ({ row }) => (
      <>
        {row.name}{' '}
        <Tip
          id={`tip-component-${plan.name}-${row.name}`}
          label={row.type}
          placement="right"
        >
          <InfoIcon weight="bold" />
        </Tip>
      </>
    ),
  },
  {
    title: translate('Billing type'),
    render: ({ row }) => <BillingTypeBadge component={row} />,
  },
  {
    title: translate('Amount'),
    render: ({ row }) => <>{renderNumberOrDash(getAmount(plan, row))}</>,
  },
  {
    title: translate('Current price'),
    render: ({ row }) => {
      const price = parseFloatOrNull(plan.prices[row.type]);
      const charge = formatComponentCharge(
        row,
        getAmount(plan, row),
        price,
        plan.unit,
      );
      return (
        <>
          {renderNumberOrDash(price)}
          {charge && <div className="text-muted small">{charge}</div>}
        </>
      );
    },
  },
  {
    title: translate('Price update next month'),
    render: ({ row }) => (
      <>
        {plan.future_prices[row.type] !== null &&
        plan.future_prices[row.type] !== undefined
          ? parseFloat(plan.future_prices[row.type])
          : translate('No update')}
      </>
    ),
  },
  {
    title: translate('Units'),
    render: ({ row }) => <>{row.measured_unit}</>,
  },
];

export const PlanComponentsTable: FC<OwnProps> = (props) => {
  const rows = useMemo(
    () => resolvePlanComponents(props.components, props.row),
    [props.components, props.row],
  );
  const tableProps = useTable<EffectiveComponent>({
    table: `PlanComponentsTable-${props.row.uuid}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });

  // A price or quota edit refetches the plans table, which hands this still
  // expanded row the updated plan; the in-memory rows have to follow it.
  const fetchRef = useRef(tableProps.fetch);
  fetchRef.current = tableProps.fetch;
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) {
      fetchRef.current();
    }
    mountedRef.current = true;
  }, [rows]);

  const columns = useMemo(() => getColumns(props.row), [props.row]);

  return (
    <Table<EffectiveComponent>
      {...tableProps}
      columns={columns}
      verboseName={translate('components')}
      hideTitle
      hasActionBar={false}
      hoverShadow={false}
      placeholderHasRetry={false}
      minHeight="auto"
    />
  );
};
