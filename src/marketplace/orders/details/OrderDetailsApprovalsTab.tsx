import { Card } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { OrderSummaryMessage } from './OrderSummaryMessage';

export const OrderDetailsApprovalsTab = ({ order, offering }) => {
  return (
    <Card>
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Approvals')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body className="custom-padding-zero">
        <div className="container ml-0">
          <Field
            label={translate('Description')}
            value={<OrderSummaryMessage order={order} offering={offering} />}
          />
          <Field
            label={translate('Created by')}
            value={order.created_by_full_name}
          />
          <Field
            label={translate('Created at')}
            value={formatDateTime(order.created)}
          />
          <Field
            label={translate('Reviewed by provider')}
            value={order.consumer_reviewed_by_full_name}
          />
          <Field
            label={translate('Reviewed by provider at')}
            value={formatDateTime(order.consumer_reviewed_at)}
          />
          <Field
            label={translate('Reviewed by consumer')}
            value={order.consumer_reviewed_by_full_name}
          />
          <Field
            label={translate('Reviewed by consumer at')}
            value={formatDateTime(order.consumer_reviewed_at)}
          />
        </div>
      </Card.Body>
    </Card>
  );
};
