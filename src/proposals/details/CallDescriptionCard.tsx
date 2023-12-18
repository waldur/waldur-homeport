import Markdown from 'markdown-to-jsx';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ProposalCall } from '../types';

interface CallDescriptionCardProps {
  call: ProposalCall;
}

export const CallDescriptionCard = ({ call }: CallDescriptionCardProps) => {
  return (
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
  );
};
