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
import { renderFieldOrDash } from '@/table/utils';

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

/**
 * Plan columns are secondary columns: they render a bare value and let the
 * table style it. Only the first column carries emphasis, so each cell is a
 * single line rather than a stacked figure-and-qualifier.
 */
const totalText = (pricing: PlanPricing) =>
  pricing.oneTime > 0
    ? translate('{price} / {period} + {once} once', {
        price: defaultCurrency(pricing.monthlyBase),
        period: pricing.periodLabel,
        once: defaultCurrency(pricing.oneTime),
      })
    : translate('{price} / {period}', {
        price: defaultCurrency(pricing.monthlyBase),
        period: pricing.periodLabel,
      });

/** What the plan commits to, for viewers who may not see the money. */
const concealedText = (pricing: PlanPricing, component?: Component) => {
  if (!component) {
    return undefined;
  }
  const unit = component.measured_unit;
  switch (component.billing_type) {
    case 'fixed':
      return unit === pricing.plan.unit
        ? translate('Included')
        : translate('{amount} {unit} included', {
            amount: component.amount,
            unit,
          });
    case 'limit':
      return translate('You choose the amount');
    case 'usage':
      return translate('Metered');
    case 'few':
      return translate('On plan switch');
    default:
      return translate('One-time');
  }
};

const componentText = (pricing: PlanPricing, component?: Component) => {
  if (!component) {
    return undefined;
  }
  if (!component.price) {
    return component.billing_type === 'fixed'
      ? translate('Included')
      : translate('No charge');
  }
  const unit = component.measured_unit;
  const period = pricing.periodLabel;

  if (component.billing_type === 'fixed') {
    const price = defaultCurrency(
      component.subTotal * pricing.monthlyMultiplier,
    );
    // A fee measured in the billing unit itself is flat; restating "1 month"
    // beside its own monthly price says nothing.
    return unit === pricing.plan.unit
      ? translate('{price} / {period}', { price, period })
      : translate('{price} / {period} for {amount} {unit}', {
          price,
          period,
          amount: component.amount,
          unit,
        });
  }

  if (component.billing_type === 'limit') {
    // limit_period says how the cap resets, not how the price is denominated —
    // the backend invoices limit components in the plan's own billing unit
    // (see combinePrices, and billing_limit._create_invoice_item). A `total`
    // period is billed once rather than per period.
    const isOneOff = component.limit_period === 'total';
    const price = rate(
      isOneOff ? component.price : component.price * pricing.monthlyMultiplier,
    );
    return isOneOff
      ? translate('{price} per {unit}, once', { price, unit })
      : translate('{price} per {unit} / {period}', { price, unit, period });
  }

  const price = rate(component.price);

  if (component.billing_type === 'usage') {
    return translate('{price} per {unit}, metered', { price, unit });
  }

  // Charged when the customer switches onto this plan, not when they order it.
  if (component.billing_type === 'few') {
    return unit
      ? translate('{price} per {unit}, on plan switch', { price, unit })
      : translate('{price}, on plan switch', { price });
  }

  return unit
    ? translate('{price} per {unit}, once', { price, unit })
    : translate('{price}, once', { price });
};

const PlanHeader = ({ pricing }: { pricing: PlanPricing }) => (
  <Tip
    label={pricing.plan.description}
    id={`plan-${pricing.plan.uuid}`}
    autoWidth
  >
    <span>{pricing.plan.name}</span>
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
        // The main column: the only one that carries emphasis, and the only
        // one allowed a second line.
        title: translate('Component'),
        render: ({ row }) => (
          <div className="d-flex flex-column">
            <span className="title">{row.label}</span>
            {row.unit && <span className="description">{row.unit}</span>}
          </div>
        ),
      },
      ...pricings.map((pricing) => ({
        id: pricing.plan.uuid,
        title: <PlanHeader pricing={pricing} />,
        render: ({ row }: { row: ComparisonRow }) =>
          renderFieldOrDash(
            row.kind === 'total'
              ? totalText(pricing)
              : concealPrices
                ? concealedText(pricing, row.byPlan[pricing.plan.uuid])
                : componentText(pricing, row.byPlan[pricing.plan.uuid]),
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
    <Table<ComparisonRow>
      {...tableProps}
      columns={columns}
      verboseName={translate('plans')}
      equalColWidth
      hideTitle
      hasActionBar={false}
      hasPagination={false}
      placeholderHasRetry={false}
      // Already inside the Plans panel: no second card border, and no second
      // set of padding around it.
      cardBordered={false}
      bodyClassName="p-0"
    />
  );
};
