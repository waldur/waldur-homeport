import Markdown from 'markdown-to-jsx';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { Call } from '../types';

import { CallDetailsFields } from './CallDetailsFields';

interface CallDescriptionCardProps {
  call: Call;
}

export const CallDescriptionCard = ({ call }: CallDescriptionCardProps) => (
  <Card>
    <Card.Header>
      <Card.Title>
        <h3>{translate('Description')}</h3>
      </Card.Title>
    </Card.Header>
    <Card.Body>
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
    </Card.Body>
  </Card>
);
