import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

export const ErrorDetailsTab = ({ order }) => {
  return (
    <Card bordered>
      <CardHeader className="custom-card-header custom-padding-zero">
        <CardTitle as="div">
          <h3>{translate('Error details')}</h3>
        </CardTitle>
      </CardHeader>
      {order.error_message ? (
        <CardContent>
          <div>
            <p>{translate('Error details')}:</p>
            <pre>{order.error_message}</pre>
          </div>
          <div>
            <p>{translate('Error trace')}:</p>
            <pre>{order.error_traceback}</pre>
          </div>
        </CardContent>
      ) : (
        <NoResult
          title={translate('No errors found for this order')}
          message={null}
          noAction
        />
      )}
    </Card>
  );
};
