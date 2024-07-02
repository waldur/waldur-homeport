import { Badge } from 'react-bootstrap';

import { formatProposalState } from '../utils';
import './ProposalBadge.scss';

const stateColorMapping = {
  draft: 'custom-badge-draft',
  team_verification: 'custom-badge-team-verification',
  submitted: 'custom-badge-submitted',
  in_review: 'custom-badge-in-review',
  in_revision: 'custom-badge-in-revision',
  accepted: 'custom-badge-accepted',
  rejected: 'custom-badge-rejected',
  canceled: 'custom-badge-canceled',
};

export const ProposalBadge = ({ state }) => {
  const className = stateColorMapping[state] || 'custom-badge-default';
  return (
    <Badge className={`ms-4 ${className}`} bg={null}>
      {formatProposalState(state)}
    </Badge>
  );
};
