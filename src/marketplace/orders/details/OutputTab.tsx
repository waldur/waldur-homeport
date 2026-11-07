import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { CodeLine } from '@/core/CodeLine';
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
          {order.output.split('\n').map((line: string, index: number) => (
            <CodeLine key={index} variant="dense" lineNumber={index + 1} prompt>
              {line}
            </CodeLine>
          ))}
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
