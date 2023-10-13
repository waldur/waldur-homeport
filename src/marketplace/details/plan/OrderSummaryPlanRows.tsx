import { useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';

import { Component, PricesData } from './types';
import { useComponentsDetailPrices } from './utils';

interface OrderSummaryPlanRowsProps {
  priceData: PricesData;
}

const getRowLabel = (component: Component) =>
  `${component.name} ${component.amount} ${component.measured_unit}`;

export const OrderSummaryPlanRows = (props: OrderSummaryPlanRowsProps) => {
  const { periodic, oneTime } = useComponentsDetailPrices(props.priceData);

  const monthlyPriceIndex = useMemo(() => {
    const index = props.priceData.periodKeys.indexOf('monthly');
    return index > -1 ? index : 0;
  }, [props.priceData.periodKeys]);

  const periodicRows = periodic.fixedRows.concat(periodic.periodicLimitedRows);

  const oneTimeRows = oneTime.initialRows
    .concat(oneTime.switchRows)
    .concat(oneTime.totalLimitedRows);

  const total =
    periodic.periodicTotal[monthlyPriceIndex] + oneTime.oneTimeTotal;

  return (
    <>
      {periodic.hasPeriodicCost && (
        <>
          {periodicRows.map((row, i) => (
            <CheckoutPricingRow
              key={i}
              label={getRowLabel(row)}
              value={defaultCurrency(row.prices[monthlyPriceIndex]) + '/mo'}
            />
          ))}
          <CheckoutPricingRow
            label={translate('Monthly cost')}
            value={
              defaultCurrency(periodic.periodicTotal[monthlyPriceIndex]) + '/mo'
            }
            className="fs-5"
          />
          <hr />
        </>
      )}
      {oneTime.hasOneTimeCost && (
        <>
          {oneTimeRows.map((row, i) => (
            <CheckoutPricingRow
              key={i}
              label={getRowLabel(row)}
              value={defaultCurrency(row.prices[monthlyPriceIndex])}
            />
          ))}
          <CheckoutPricingRow
            label={translate('One time cost')}
            value={defaultCurrency(oneTime.oneTimeTotal)}
            className="fs-5"
          />
          <hr />
        </>
      )}
      <CheckoutPricingRow
        label={translate('Total')}
        value={defaultCurrency(total || 0)}
        className="fs-4"
      />
    </>
  );
};
