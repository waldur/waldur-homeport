import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { PublicOfferingPricingPlans } from '@waldur/marketplace/offerings/details/PublicOfferingPricingPlans';
import { Offering } from '@waldur/marketplace/types';
import './PublicOfferingPricingPlansContainer.scss';

interface PublicOfferingPricingPlansContainerProps {
  offering: Offering;
}

export const PublicOfferingPricingPlansContainer: FunctionComponent<PublicOfferingPricingPlansContainerProps> = ({
  offering,
}) => (
  <div className="pricingPlansContainer">
    <div className="pricingPlansContainer__header m-b">
      <h1>{translate('Pricing & setup')}</h1>
      <span className="pricingPlansContainer__header__download">
        <i className="fa fa-download" />
        {translate('Download full price list')}
      </span>
    </div>
    <PublicOfferingPricingPlans offering={offering} />
  </div>
);
