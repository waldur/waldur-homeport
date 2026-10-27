import { ClockCountdownIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { BaseButton, RadialBackground } from 'waldur-ui';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';
import './OrganizationReviewStatus.scss';

interface OrganizationReviewStatusProps {
  onGoToDashboard: () => void;
  companyName: string;
}

export const OrganizationReviewStatus: FunctionComponent<
  OrganizationReviewStatusProps
> = ({ onGoToDashboard, companyName }) => {
  const displayName = renderFieldOrDash(companyName);
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
      <Card.Body className="text-center relative overflow-hidden organization-review-status">
        <RadialBackground className="icon-background" />

        <div className="review-icon-wrapper mb-5">
          <ClockCountdownIcon
            size={34}
            weight="bold"
            className="text-tertiary"
          />
        </div>

        <h3 className="mb-2.5 font-medium">
          {translate('Review in progress')}
        </h3>

        <p className="text-quaternary mx-auto mb-5 max-w-[600px] text-base">
          {translate(
            "Your manual verification request has been submitted and our staff team will review your application within 3 business days. You'll receive an email notification once the review is complete.",
          )}
        </p>

        <div className="mb-5">
          <div className="text-center">
            <div className="mb-1.5">
              <span className="font-medium text-secondary">
                {translate('Company')}:
              </span>{' '}
              <span className="text-quaternary">{displayName}</span>
            </div>
            <div>
              <span className="font-medium text-secondary">
                {translate('Submitted')}:
              </span>{' '}
              <span className="text-quaternary">
                {submittedAt} at {submittedTime}
              </span>
            </div>
          </div>
        </div>

        <h4 className="mb-2.5 font-medium">
          {translate('Data storage information')}
        </h4>
        <p className="text-quaternary mx-auto mb-5 max-w-[600px] text-base">
          {translate(
            'Your application will be available in your dashboard with the relevant submitted information. If your application is rejected, it will remain available for 30 days so you can review the feedback. After this period, it will be automatically removed.',
          )}
        </p>

        <BaseButton
          variant="tertiary"
          onClick={onGoToDashboard}
          className="px-6 mt-4"
          label={translate('Go to dashboard')}
          size="lg"
        />
      </Card.Body>
    </Card>
  );
};
