import Markdown from 'markdown-to-jsx';

import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { translate } from '@/i18n';

import { Call } from '../types';

import { CallDetailsFields } from './CallDetailsFields';

interface CallDescriptionCardProps {
  call: Call;
}

export const CallDescriptionCard = ({ call }: CallDescriptionCardProps) => (
  <Card bordered>
    <CardHeader>
      <CardTitle as="div">
        <h3>{translate('Description')}</h3>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Markdown
        options={{
          overrides: {
            CallDetailsFields: {
              component: () => <CallDetailsFields call={call} />,
            },
          },
        }}
      >
        {call.description || '<CallDetailsFields></CallDetailsFields>'}
      </Markdown>
    </CardContent>
  </Card>
);
