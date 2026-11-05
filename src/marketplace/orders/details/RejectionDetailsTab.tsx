import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { translate } from '@/i18n';

export const RejectionDetailsTab = ({ order }) => {
  return (
    <Card bordered>
      <CardHeader className="custom-card-header custom-padding-zero">
        <CardTitle as="div">
          <h3>{translate('Rejection details')}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {order.consumer_rejection_comment && (
          <div>
            <p>{translate('Consumer rejection reason')}:</p>
            <pre>{order.consumer_rejection_comment}</pre>
          </div>
        )}
        {order.provider_rejection_comment && (
          <div>
            <p>{translate('Provider rejection reason')}:</p>
            <pre>{order.provider_rejection_comment}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
