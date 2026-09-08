import { FC, useMemo } from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { defaultCurrency, formatCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { Component } from '@/marketplace/details/plan/types';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { getOrderablePlans, getPlanPricing, PlanPricing } from './planPricing';

/** Rates go finer than the two decimals a total needs — 0.015 per GB is real. */
const rate = (value: number) =>
  formatCurrency(value, ENV.plugins.WALDUR_CORE.CURRENCY_NAME, 4);

/** Components are grouped by how they are charged, cheapest commitment first. */
const BILLING_TYPE_ORDER = ['fixed', 'limit', 'usage', 'one', 'few'];

interface ComparisonRow {
  uuid: string;
  kind: 'total' | 'component';
  label: string;
  /** Suppressed for flat recurring fees, where the unit repeats the period. */
  unit?: string;
  billingType?: string;
  byPlan: Record<string, Component>;
}

const TotalCell = ({ pricing }: { pricing: PlanPricing }) => (
  <div>
    <div className="fs-3 fw-bold text-gray-900">
      {defaultCurrency(pricing.monthlyBase)}
      <span className="fs-7 fw-normal text-muted">
        {' / '}
        {pricing.periodLabel}
      </span>
    </div>
    {pricing.oneTime > 0 && (
      <div className="fs-8 text-muted">
        {translate('plus {price} once', {
          price: defaultCurrency(pricing.oneTime),
        })}
      </div>
    )}
  </div>
);

/** What the plan commits to, for viewers who may not see the money. */
const ConcealedCell = ({
  pricing,
  component,
}: {
  pricing: PlanPricing;
  component?: Component;
}) => {
  if (!component) {
    return <span className="text-muted">—</span>;
  }
  const unit = component.measured_unit;
  return (
    <span className="text-muted">
      {component.billing_type === 'fixed'
        ? unit === pricing.plan.unit
          ? translate('Included')
          : translate('{amount} {unit} included', {
              amount: component.amount,
              unit,
            })
        : component.billing_type === 'limit'
          ? translate('You choose the amount')
          : component.billing_type === 'usage'
            ? translate('Metered')
            : component.billing_type === 'few'
              ? translate('On plan switch')
              : translate('One-time')}
    </span>
  );
};

const ComponentCell = ({
  pricing,
  component,
}: {
  pricing: PlanPricing;
  component?: Component;
}) => {
  if (!component) {
    return <span className="text-muted">—</span>;
  }
  if (!component.price) {
    return (
      <span className="text-muted">
        {component.billing_type === 'fixed'
          ? translate('Included')
          : translate('No charge')}
      </span>
    );
  }
  const unit = component.measured_unit;
  // A fee measured in the billing unit itself is flat; restating "1 month
  // included" underneath its own monthly price says nothing.
  const isFlatFee = unit === pricing.plan.unit;

  if (component.billing_type === 'fixed') {
    return (
      <div>
        <div className="fw-semibold text-gray-900">
          {defaultCurrency(component.subTotal * pricing.monthlyMultiplier)}
          <span className="fs-8 fw-normal text-muted">
            {' / '}
            {pricing.periodLabel}
          </span>
        </div>
        {!isFlatFee && (
          <div className="fs-8 text-muted">
            {translate('{amount} {unit} included', {
              amount: component.amount,
              unit,
            })}
          </div>
        )}
      </div>
    );
  }

  if (component.billing_type === 'limit') {
    // limit_period says how the cap resets, not how the price is denominated —
    // the backend invoices limit components in the plan's own billing unit
    // (see combinePrices, and billing_limit._create_invoice_item). A `total`
    // period is billed once rather than per period.
    const isOneOff = component.limit_period === 'total';
    return (
      <div>
        <div className="fw-semibold text-gray-900">
          {rate(
            isOneOff
              ? component.price
              : component.price * pricing.monthlyMultiplier,
          )}
        </div>
        <div className="fs-8 text-muted">
          {isOneOff
            ? translate('per {unit}, once', { unit })
            : translate('per {unit} / {period}', {
                unit,
                period: pricing.periodLabel,
              })}
        </div>
      </div>
    );
  }

  if (component.billing_type === 'usage') {
    return (
      <div>
        <div className="fw-semibold text-gray-900">{rate(component.price)}</div>
        <div className="fs-8 text-muted">
          {translate('per {unit}, metered', { unit })}
        </div>
      </div>
    );
  }

  // Charged when the customer switches onto this plan, not when they order it.
  if (component.billing_type === 'few') {
    return (
      <div>
        <div className="fw-semibold text-gray-900">{rate(component.price)}</div>
        <div className="fs-8 text-muted">
          {unit
            ? translate('per {unit}, on plan switch', { unit })
            : translate('once, on plan switch')}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fw-semibold text-gray-900">{rate(component.price)}</div>
      <div className="fs-8 text-muted">
        {unit
          ? translate('per {unit}, once', { unit })
          : translate('once, at order')}
      </div>
    </div>
  );
};

const PlanHeader = ({ pricing }: { pricing: PlanPricing }) => (
  <Tip
    label={pricing.plan.description}
    id={`plan-${pricing.plan.uuid}`}
    autoWidth
  >
    <span className="fw-bold text-gray-900">{pricing.plan.name}</span>
  </Tip>
);

interface PlanComparisonProps {
  offering: PublicOfferingDetails;
}

export const PlanComparison: FC<PlanComparisonProps> = ({ offering }) => {
  const concealPrices = isFeatureVisible(MarketplaceFeatures.conceal_prices);

  const pricings = useMemo(
    () =>
      getOrderablePlans(offering).map((plan) => getPlanPricing(offering, plan)),
    [offering],
  );

  const anyVariableCost = useMemo(
    () => !concealPrices && pricings.some((pricing) => pricing.hasVariableCost),
    [pricings, concealPrices],
  );

  const rows = useMemo<ComparisonRow[]>(() => {
    const componentRows = new Map<string, ComparisonRow>();
    pricings.forEach((pricing) => {
      pricing.components.forEach((component) => {
        if (!componentRows.has(component.type)) {
          componentRows.set(component.type, {
            uuid: component.type,
            kind: 'component',
            label: component.name,
            unit:
              component.measured_unit === pricing.plan.unit
                ? undefined
                : component.measured_unit,
            billingType: component.billing_type,
            byPlan: {},
          });
        }
        componentRows.get(component.type).byPlan[pricing.plan.uuid] = component;
      });
    });

    const totalRow: ComparisonRow = {
      uuid: '__total__',
      kind: 'total',
      // The figure is a floor, not a quote, whenever anything is metered or
      // sized by the customer — say so in the label rather than in a footnote
      // the reader has to find.
      label: anyVariableCost ? translate('Starting price') : translate('Price'),
      byPlan: {},
    };

    return [
      ...(concealPrices ? [] : [totalRow]),
      ...Array.from(componentRows.values()).sort(
        (a, b) =>
          BILLING_TYPE_ORDER.indexOf(a.billingType) -
          BILLING_TYPE_ORDER.indexOf(b.billingType),
      ),
    ];
  }, [pricings, anyVariableCost, concealPrices]);

  const columns = useMemo<Column<ComparisonRow>[]>(
    () => [
      {
        title: translate('Component'),
        render: ({ row }) => (
          <div>
            <div
              className={
                row.kind === 'total'
                  ? 'fw-bold text-gray-900'
                  : 'fw-semibold text-gray-800'
              }
            >
              {row.label}
            </div>
            {row.unit && <div className="fs-8 text-muted">{row.unit}</div>}
          </div>
        ),
      },
      ...pricings.map((pricing) => ({
        id: pricing.plan.uuid,
        title: <PlanHeader pricing={pricing} />,
        render: ({ row }: { row: ComparisonRow }) =>
          row.kind === 'total' ? (
            <TotalCell pricing={pricing} />
          ) : concealPrices ? (
            <ConcealedCell
              pricing={pricing}
              component={row.byPlan[pricing.plan.uuid]}
            />
          ) : (
            <ComponentCell
              pricing={pricing}
              component={row.byPlan[pricing.plan.uuid]}
            />
          ),
      })),
    ],
    [pricings, concealPrices],
  );

  const tableProps = useTable<ComparisonRow>({
    table: `offering-plan-comparison-${offering.uuid}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });

  return (
    <>
      <Table<ComparisonRow>
        {...tableProps}
        columns={columns}
        verboseName={translate('plans')}
        equalColWidth
        hideTitle
        hasActionBar={false}
        hasPagination={false}
        placeholderHasRetry={false}
      />
      {anyVariableCost && (
        <p className="text-muted fs-7 mt-3 mb-0">
          {translate(
            'The starting price covers what the plan fixes. Components you size yourself and metered usage are charged on top, at the rates above.',
          )}
        </p>
      )}
    </>
  );
};
