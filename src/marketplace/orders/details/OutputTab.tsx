import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { CodeBlockPreview } from '@/core/CodeBlockPreview';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

export const OutputTab = ({ order }) => {
  return (
    <Card bordered>
      <CardHeader className="custom-card-header custom-padding-zero">
        <CardTitle as="div">
          <h3>{translate('Output')}</h3>
        </CardTitle>
      </CardHeader>
      {order.output ? (
        <CardContent>
          <CodeBlockPreview code={order.output} />
        </CardContent>
      ) : (
        <NoResult
          title={translate('No outputs found for this order')}
          message={null}
          noAction
        />
      )}
    </Card>
  );
};
