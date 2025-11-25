import { ClockCountdownIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button, Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { RadialBg } from '@waldur/navigation/header/search/RadialBg';

import './OrganizationReviewStatus.scss';

interface OrganizationReviewStatusProps {
  onGoToDashboard: () => void;
  companyName: string;
}

export const OrganizationReviewStatus: FunctionComponent<
  OrganizationReviewStatusProps
> = ({ onGoToDashboard, companyName }) => {
  const displayName = companyName || 'N/A';
  const submittedAt = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: false,
  });
  const submittedTime = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center position-relative overflow-hidden organization-review-status">
        <RadialBg className="icon-background" />

        <div className="review-icon-wrapper mb-6">
          <ClockCountdownIcon
            size={34}
            weight="bold"
            className="text-gray-600"
          />
        </div>

        <h3 className="mb-3 fw-bold">{translate('Review in progress')}</h3>

        <p
          className="text-muted mb-6 fs-5"
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          {translate(
            "Your manual verification request has been submitted and our staff team will review your application within 3 business days. You'll receive an email notification once the review is complete.",
          )}
        </p>

        <div className="mb-6">
          <div className="text-center">
            <div className="mb-2">
              <span className="fw-bold text-gray-700">
                {translate('Company')}:
              </span>{' '}
              <span className="text-gray-500">{displayName}</span>
            </div>
            <div>
              <span className="fw-bold text-gray-700">
                {translate('Submitted')}:
              </span>{' '}
              <span className="text-gray-500">
                {submittedAt} at {submittedTime}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="tertiary"
          size="lg"
          onClick={onGoToDashboard}
          className="px-8 mt-5"
        >
          {translate('Go to dashboard')}
        </Button>
      </Card.Body>
    </Card>
  );
};
