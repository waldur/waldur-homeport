import { ArrowRightIcon, InfoIcon } from '@phosphor-icons/react';
import { Card } from 'react-bootstrap';
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
  <Card className="card-bordered">
    <Card.Body className="d-flex align-items-center fw-bold p-5">
      <div className="icon-square me-5">
        <InfoIcon weight="bold" />
      </div>
      <p className="mb-0 d-flex align-items-center">
        {message}
        {': '}
        {defaultCurrency(order.old_cost_estimate)}
        <ArrowRightIcon weight="bold" className="mx-1" />
        {defaultCurrency(order.new_cost_estimate)}{' '}
        {translate('(VAT is not included)')}
      </p>
    </Card.Body>
  </Card>
);
