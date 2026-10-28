import { ArrowRightIcon, InfoIcon } from '@phosphor-icons/react';
import { OrderDetails } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

export const CostEstimatedChangeView = ({
  order,
  message,
}: {
  order: OrderDetails;
  message: string;
}) => (
  <div className="card card-bordered">
    <div className="card-body flex items-center font-medium p-4">
      <div className="icon-square me-4">
        <InfoIcon weight="bold" />
      </div>
      <p className="mb-0 flex items-center">
        {message}
        {': '}
        {defaultCurrency(order.old_cost_estimate)}
        <ArrowRightIcon weight="bold" className="mx-1" />
        {defaultCurrency(order.new_cost_estimate)}{' '}
        {translate('(VAT is not included)')}
      </p>
    </div>
  </div>
);
