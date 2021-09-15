import { FunctionComponent } from 'react';

import { AuthService } from '@waldur/auth/AuthService';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { GoogleCalendarLink } from '@waldur/marketplace/offerings/details/GoogleCalendarLink';
import { shouldRenderAttributesSection } from '@waldur/marketplace/offerings/details/utils';
import { CopyToClipboard } from '@waldur/marketplace/offerings/service-providers/shared/CopyToClipboard';
import { ReferralDetailsButton } from '@waldur/marketplace/referral/ReferralDetailsButton';
import { Offering } from '@waldur/marketplace/types';
import './PublicOfferingAttributesSection.scss';

interface PublicOfferingAttributesSectionProps {
  offering: Offering;
  googleCalendarLink: string;
}

export const PublicOfferingAttributesSection: FunctionComponent<PublicOfferingAttributesSectionProps> = ({
  offering,
  googleCalendarLink,
}) =>
  shouldRenderAttributesSection(offering, googleCalendarLink) ? (
    <div className="bordered publicOfferingAttributesSection m-b-sm">
      {offering.datacite_doi && (
        <div>
          <b>{translate('Datacite DOI')}:</b>
          <span className="m-l-sm m-r">{offering.datacite_doi}</span>
          <CopyToClipboard value={offering.datacite_doi} />
        </div>
      )}
      {offering.citation_count >= 0 && (
        <div className="publicOfferingAttributesSection__referralCount">
          <div>
            <b>{translate('Referral count')}:</b>
            <span className="m-l-sm">{offering.citation_count}</span>
          </div>
          {offering.citation_count > 0 && (
            <ReferralDetailsButton offering={offering} />
          )}
        </div>
      )}
      {googleCalendarLink &&
        AuthService.isAuthenticated() &&
        offering.type === OFFERING_TYPE_BOOKING && (
          <GoogleCalendarLink link={googleCalendarLink} />
        )}
    </div>
  ) : null;
