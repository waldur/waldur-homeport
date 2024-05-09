import Markdown from 'markdown-to-jsx';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { Call } from '../types';

interface CallDescriptionCardProps {
  call: Call;
}

export const CallDescriptionCard = ({ call }: CallDescriptionCardProps) => {
  return call.description ? (
    <Card id="description" className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Description')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Markdown>{call.description}</Markdown>
      </Card.Body>
    </Card>
  ) : null;
};
