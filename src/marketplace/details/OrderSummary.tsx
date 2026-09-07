import { createElement, FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { DeployPageTotalCard } from '../deploy/DeployPageTotalCard';
import { FormStepProps } from '../deploy/types';

import { OrderSubmitButton } from './OrderSubmitButton';
import { OrderSummaryPlanRows } from './plan/OrderSummaryPlanRows';
import { useOrderPrices, useComponentsDetailPrices } from './plan/utils';
import { OrderSummaryProps } from './types';

export const SummaryTable: FC<OrderSummaryProps> = (props) => {
  const formData = useOrderFormData();
  return (
    <div className={props.onlyDetails ? 'fs-6' : 'mb-8 fs-6'}>
      {props.extraComponent ? createElement(props.extraComponent, props) : null}
      {formData && formData.plan && (
        <OrderSummaryPlanRows
          priceData={props.prices}
          customer={formData.customer}
          hasTotal={props.onlyDetails}
          concealPrices={props.shouldConcealPrices}
        />
      )}
    </div>
  );
};

const OrderCheckout: FC<OrderSummaryProps> = (props) => {
  const { periodic, oneTime } = useComponentsDetailPrices(props.prices);

  const monthlyPriceIndex = Math.max(
    props.prices.periodKeys.indexOf('monthly'),
    0,
  );
  const monthlyRecurring = periodic.totalPeriods[monthlyPriceIndex] || 0;
  const total = monthlyRecurring + oneTime.oneTimeTotal;
  const hasUsage = periodic.usageRows.length > 0;
  const totalLabel = hasUsage
    ? total
      ? translate('{amount} + usage', { amount: defaultCurrency(total) })
      : translate('Billed by usage')
    : defaultCurrency(total || 0);

  return (
    <DeployPageTotalCard
      total={props.shouldConcealPrices ? DASH_ESCAPE_CODE : totalLabel}
      offering={props.offering}
      monthlyRecurringCost={monthlyRecurring}
    >
      <SummaryTable {...props} />
      <OrderSubmitButton />
    </DeployPageTotalCard>
  );
};

export const OrderSummary: FC<{
  offering: FormStepProps['offering'];
  onlyDetails?: boolean;
  [key: string]: any;
}> = (props) => {
  const formData = useOrderFormData();
  const customer = formData?.customer;
  const prices = useOrderPrices(props);
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    customer?.display_billing_info_in_projects === false;

  const summaryProps: OrderSummaryProps = {
    ...props,
    prices,
    shouldConcealPrices,
  };

  return props.onlyDetails ? (
    <SummaryTable {...summaryProps} />
  ) : (
    <OrderCheckout {...summaryProps} />
  );
};
