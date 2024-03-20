import { Badge, Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { formatProposalState } from '@waldur/proposals/utils';

export const ProposalHeader = ({ proposal }) => (
  <Card>
    <Card.Body>
      <div className="d-flex mb-4">
        <h3 className="mb-0">
          {translate('Proposal')} - {proposal.name}
        </h3>
        <Badge bg="light" text="dark" className="ms-4">
          {formatProposalState(proposal.state)}
        </Badge>
      </div>
      <p className="text-muted fst-italic">UUID: {proposal.uuid}</p>
    </Card.Body>
  </Card>
);
