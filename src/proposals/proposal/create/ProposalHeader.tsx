import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ProposalBadge } from '../ProposalBadge';

export const ProposalHeader = ({ proposal }) => (
  <Card>
    <Card.Body>
      <div className="d-flex mb-4">
        <h3 className="mb-0">
          {translate('Proposal')} - {proposal.name}
        </h3>
        <ProposalBadge state={proposal.state} />
      </div>
      <p className="text-muted fst-italic">UUID: {proposal.uuid}</p>
    </Card.Body>
  </Card>
);
