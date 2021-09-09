import { FunctionComponent } from 'react';

import { AuthService } from '@waldur/auth/AuthService';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { AttributesList } from '@waldur/marketplace/offerings/details/AttributesList';
import { GoogleCalendarLink } from '@waldur/marketplace/offerings/details/GoogleCalendarLink';
import { CopyToClipboard } from '@waldur/marketplace/offerings/service-providers/shared/CopyToClipboard';
import { ReferralDetailsButton } from '@waldur/marketplace/referral/ReferralDetailsButton';
import { Category, Offering } from '@waldur/marketplace/types';
import './PublicOfferingAttributes.scss';

interface PublicOfferingAttributesProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingAttributes: FunctionComponent<PublicOfferingAttributesProps> = ({
  offering,
  category,
}) => (
  <div className="publicOfferingAttributes bordered">
    {offering.datacite_doi ||
    offering.citation_count >= 0 ||
    (AuthService.isAuthenticated() &&
      offering.type === OFFERING_TYPE_BOOKING) ? (
      <div className="bordered publicOfferingAttributes__borderedContent m-b-sm">
        {offering.datacite_doi && (
          <div>
            <b>{translate('Datacite DOI')}:</b>
            <span className="m-l-sm m-r">{offering.datacite_doi}</span>
            <CopyToClipboard value={offering.datacite_doi} />
          </div>
        )}
        {offering.citation_count >= 0 && (
          <div className="publicOfferingAttributes__borderedContent__referralCount m-t">
            <div>
              <b>{translate('Referral count')}:</b>
              <span className="m-l-sm">{offering.citation_count}</span>
            </div>
            {offering.citation_count > 0 && (
              <ReferralDetailsButton offering={offering} />
            )}
          </div>
        )}
        {AuthService.isAuthenticated() &&
          offering.type === OFFERING_TYPE_BOOKING && (
            <GoogleCalendarLink offering={offering} />
          )}
      </div>
    ) : null}

    <AttributesList
      attributes={offering.attributes}
      sections={category.sections}
    />
  </div>
);
