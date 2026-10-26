import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CopyToClipboard } from '@/marketplace/common/CopyToClipboard';
import { ReferralDetailsButton } from '@/marketplace/referral/ReferralDetailsButton';
import './PublicOfferingAttributesSection.scss';

interface PublicOfferingAttributesSectionProps {
  offering: Offering;
}

export const PublicOfferingAttributesSection: FunctionComponent<
  PublicOfferingAttributesSectionProps
> = ({ offering }) => (
  <div className="publicOfferingAttributesSection mb-2">
    {offering.datacite_doi && (
      <div>
        <b>{translate('Datacite DOI')}:</b>
        <span className="ms-2">{offering.datacite_doi}</span>
        <CopyToClipboard value={offering.datacite_doi} />
      </div>
    )}
    {offering.citation_count >= 0 && (
      <div className="publicOfferingAttributesSection__referralCount">
        <div>
          <b>{translate('Referral count')}:</b>
          <span className="ms-2">{offering.citation_count}</span>
        </div>
        {offering.citation_count > 0 && (
          <ReferralDetailsButton offering={offering as any} />
        )}
      </div>
    )}
  </div>
);
