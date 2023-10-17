import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';
import { concealPricesSelector } from '@waldur/marketplace/deploy/utils';
import { Customer } from '@waldur/workspace/types';

import { Component, PricesData } from './types';
import { useComponentsDetailPrices } from './utils';

interface OrderSummaryPlanRowsProps {
  priceData: PricesData;
  customer: Customer;
}

const getRowLabel = (component: Component) =>
  `${component.name} ${component.amount} ${component.measured_unit}`;

export const OrderSummaryPlanRows = (props: OrderSummaryPlanRowsProps) => {
  const activeFixedPriceProfile =
    props.customer &&
    getActiveFixedPricePaymentProfile(props.customer.payment_profiles);
  const shouldConcealPrices = useSelector(concealPricesSelector);

  const { periodic, oneTime } = useComponentsDetailPrices(props.priceData);

  const monthlyPriceIndex = useMemo(() => {
    const index = props.priceData.periodKeys.indexOf('monthly');
    return index > -1 ? index : 0;
  }, [props.priceData.periodKeys]);

  const oneTimeRows = oneTime.initialRows
    .concat(oneTime.switchRows)
    .concat(oneTime.totalLimitedRows);

  const total =
    periodic.periodicTotal[monthlyPriceIndex] + oneTime.oneTimeTotal;

  return (
    <>
      {periodic.hasPeriodicCost && (
        <>
          {!shouldConcealPrices && activeFixedPriceProfile
            ? periodic.fixedRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={getRowLabel(row)}
                  value={defaultCurrency(row.prices[monthlyPriceIndex]) + '/mo'}
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
            ? periodic.periodicLimitedRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={getRowLabel(row)}
                  value={defaultCurrency(row.prices[monthlyPriceIndex]) + '/mo'}
                />
              ))
            : periodic.periodicLimitedRows.map((row, i) => (
                <CheckoutPricingRow
                  key={i}
                  label={row.name}
                  value={`${row.amount} ${row.measured_unit}`}
                />
              ))}
          {!shouldConcealPrices && activeFixedPriceProfile && (
            <CheckoutPricingRow
              label={translate('Monthly cost')}
              value={
                defaultCurrency(periodic.periodicTotal[monthlyPriceIndex]) +
                '/mo'
              }
              className="fs-5"
            />
          )}
          <hr />
        </>
      )}
      {oneTime.hasOneTimeCost && (
        <>
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
                  value={`${row.amount} ${row.measured_unit}`}
                />
              ))}
          {!shouldConcealPrices && (
            <CheckoutPricingRow
              label={translate('One time cost')}
              value={defaultCurrency(oneTime.oneTimeTotal)}
              className="fs-5"
            />
          )}
          <hr />
        </>
      )}
      {!shouldConcealPrices && (
        <CheckoutPricingRow
          label={translate('Total')}
          value={defaultCurrency(total || 0)}
          className="fs-4"
        />
      )}
    </>
  );
};
