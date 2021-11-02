import { FunctionComponent } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { PublicOfferingPricingPlansContainer } from '@waldur/marketplace/offerings/details/PublicOfferingPricingPlansContainer';
import { OfferingPurchaseButton } from '@waldur/marketplace/offerings/service-providers/shared/OfferingPurchaseButton';
import { Offering } from '@waldur/marketplace/types';
import './PublicOfferingPricing.scss';

interface PublicOfferingPricingProps {
  offering: Offering;
}

export const PublicOfferingPricing: FunctionComponent<PublicOfferingPricingProps> =
  ({ offering }) => (
    <div className="publicOfferingPricing">
      <PublicOfferingPricingPlansContainer offering={offering} />
      <div className="publicOfferingPricing__info">
        <span className="publicOfferingPricing__info__description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam blandit
          semper tortor, at elementum sem mattis ac. Proin et eleifend erat, sed
          euismod nibh. Phasellus eu malesuada massa. Maecenas ut tempus tortor.
          Morbi hendrerit consectetur orci, a posuere leo porta a. Curabitur
          egestas nunc eget nunc vulputate, a consectetur ante hendrerit. Mauris
          pretium consectetur velit sit amet gravida. Interdum et malesuada
          fames ac ante ipsum primis in faucibus.
        </span>
        <OfferingPurchaseButton
          offering={offering}
          label={
            offering.type === OFFERING_TYPE_BOOKING
              ? translate('Book')
              : translate('Purchase')
          }
        />
      </div>
    </div>
  );
