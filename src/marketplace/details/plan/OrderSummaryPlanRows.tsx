import { useMemo } from 'react';
import { LimitPeriodEnum } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import { CheckoutPricingRow } from '@/marketplace/deploy/CheckoutPricingRow';
import { Customer } from '@/workspace/types';

import { Component, PricesData } from './types';
import { useComponentsDetailPrices } from './utils';

interface OrderSummaryPlanRowsProps {
  priceData: PricesData;
  customer: Pick<Customer, 'name' | 'uuid' | 'url' | 'payment_profiles'>;
  hasTotal?: boolean;
  concealPrices?: boolean;
}

const getRowLabel = (component: Component) => {
  const qty = component.displayAmount ?? component.amount;
  const base = `${component.name} ${qty} ${component.measured_unit}`;
  if (component.displayAmount != null && component.durationInMonths) {
    return `${base} × ${translate('{count} months', { count: component.durationInMonths })}`;
  }
  return base;
};

const getPerLimitPeriod = (limitPeriod: LimitPeriodEnum) =>
  limitPeriod === 'annual'
    ? translate('/year')
    : limitPeriod === 'quarterly'
      ? translate('/quarter')
      : limitPeriod === 'month'
        ? translate('/mo')
        : '';

export const OrderSummaryPlanRows = (props: OrderSummaryPlanRowsProps) => {
  const activeFixedPriceProfile =
    props.customer &&
    getActiveFixedPricePaymentProfile(props.customer.payment_profiles);
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) || props.concealPrices;

  const { periodic, oneTime } = useComponentsDetailPrices(props.priceData);

  const monthlyPriceIndex = useMemo(() => {
    const index = props.priceData.periodKeys.indexOf('monthly');
    return index > -1 ? index : 0;
  }, [props.priceData.periodKeys]);

  const oneTimeRows = [
    ...oneTime.initialRows,
    ...oneTime.prepaidRows,
    ...oneTime.switchRows,
    ...oneTime.totalLimitedRows,
  ];

  const totalDiscount = useMemo(
    () =>
      props.priceData.components.reduce(
        (sum, c) => sum + (c.discountAmount || 0),
        0,
      ),
    [props.priceData.components],
  );

  const total = periodic.total + oneTime.oneTimeTotal;

  return (
    <>
      {oneTime.hasOneTimeCost && (
        <div className="border-bottom mb-5">
          {!shouldConcealPrices
            ? oneTimeRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={getRowLabel(row)}
                  value={defaultCurrency(row.prices[monthlyPriceIndex])}
                />
              ))
            : oneTimeRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={row.name}
                  value={`${row.displayAmount ?? row.amount} ${row.measured_unit}`}
                />
              ))}
        </div>
      )}
      {periodic.hasPeriodicCost && (
        <div className="border-bottom mb-5">
          {!shouldConcealPrices && activeFixedPriceProfile
            ? periodic.fixedRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={getRowLabel(row)}
                  value={
                    defaultCurrency(row.prices[monthlyPriceIndex]) +
                    getPerLimitPeriod('month')
                  }
                />
              ))
            : periodic.fixedRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={row.name}
                  value={`${row.amount} ${row.measured_unit}`}
                />
              ))}
          {!shouldConcealPrices
            ? periodic.limitedRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={getRowLabel(row)}
                  value={
                    defaultCurrency(
                      row.limit_period === 'month'
                        ? (row.prices[monthlyPriceIndex] ?? row.subTotal)
                        : row.subTotal,
                    ) + getPerLimitPeriod(row.limit_period as any)
                  }
                />
              ))
            : periodic.limitedRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={row.name}
                  value={`${row.amount} ${row.measured_unit}`}
                />
              ))}
        </div>
      )}
      {oneTime.hasOneTimeCost && !shouldConcealPrices && (
        <CheckoutPricingRow
          label={translate('One time cost')}
          value={defaultCurrency(oneTime.oneTimeTotal)}
        />
      )}
      {periodic.hasPeriodicCost &&
        !shouldConcealPrices &&
        activeFixedPriceProfile && (
          <CheckoutPricingRow
            label={translate('Monthly cost')}
            value={
              defaultCurrency(periodic.totalPeriods[monthlyPriceIndex]) +
              getPerLimitPeriod('month')
            }
          />
        )}
      {totalDiscount > 0 && !shouldConcealPrices && (
        <CheckoutPricingRow
          label={translate('Volume discount savings')}
          value={'-' + defaultCurrency(totalDiscount)}
          className="text-success"
        />
      )}
      {!shouldConcealPrices && props.hasTotal && (
        <CheckoutPricingRow
          label={translate('Total')}
          value={defaultCurrency(total || 0)}
          total
          className="fs-3"
        />
      )}
    </>
  );
};
