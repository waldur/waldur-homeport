import { ShieldCheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { InvitationCoiConfiguration } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

interface COIPolicyCardProps {
  config?: InvitationCoiConfiguration | null;
}

const DISCLOSURE_LEVEL_DESCRIPTIONS: Record<string, string> = {
  titles_only: translate(
    'You will see proposal titles only when reviewing for potential conflicts.',
  ),
  titles_and_summaries: translate(
    'You will see proposal titles and summaries when reviewing for potential conflicts.',
  ),
  full_details: translate(
    'You will have access to full proposal details when reviewing for potential conflicts.',
  ),
};

export const COIPolicyCard: FC<COIPolicyCardProps> = ({ config }) => {
  if (!config) {
    return null;
  }

  // Show the card if there are any configured COI types
  const hasRecusalTypes = config.recusal_required_types?.length > 0;
  const hasManagementTypes = config.management_allowed_types?.length > 0;
  const hasDisclosureTypes = config.disclosure_only_types?.length > 0;
  const hasCOIPolicy =
    hasRecusalTypes || hasManagementTypes || hasDisclosureTypes;

  if (!hasCOIPolicy) {
    return null;
  }

  return (
    <Card className="card-bordered mb-6">
      <Card.Header className="border-bottom-0 pb-0">
        <Card.Title>
          <h3 className="d-flex align-items-center gap-2">
            <ShieldCheckIcon size={24} weight="bold" className="text-primary" />
            {translate('Conflict of interest policy')}
          </h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-column gap-4">
          {config.proposal_disclosure_level && (
            <div>
              <div className="fw-bold text-muted mb-1">
                {translate('Proposal disclosure level')}
              </div>
              <div>
                {DISCLOSURE_LEVEL_DESCRIPTIONS[
                  config.proposal_disclosure_level
                ] || config.proposal_disclosure_level}
              </div>
            </div>
          )}

          <div className="alert alert-info mb-0">
            <p className="mb-0">
              {translate(
                'This call requires you to declare any potential conflicts of interest before you can accept the invitation. Please review the proposals below and indicate any conflicts.',
              )}
            </p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
