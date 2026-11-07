import { ArrowRightIcon, InfoIcon } from '@phosphor-icons/react';
import { OrderDetails } from 'waldur-js-client';

import { Card, CardContent, IconSquare } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

export const CostEstimatedChangeView = ({
  order,
  message,
}: {
  order: OrderDetails;
  message: string;
}) => (
  <Card bordered>
    <CardContent className="flex items-center font-medium p-4">
      <IconSquare className="me-4">
        <InfoIcon weight="bold" />
      </IconSquare>
      <p className="mb-0 flex items-center">
        {message}
        {': '}
        {defaultCurrency(order.old_cost_estimate)}
        <ArrowRightIcon weight="bold" className="mx-1" />
        {defaultCurrency(order.new_cost_estimate)}{' '}
        {translate('(VAT is not included)')}
      </p>
    </CardContent>
  </Card>
);
