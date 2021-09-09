import { FunctionComponent } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';
import { OfferingPurchaseButton } from '@waldur/marketplace/offerings/service-providers/shared/OfferingPurchaseButton';
import { Offering } from '@waldur/marketplace/types';
import './PublicOfferingDetailsHeader.scss';

const GeorgiaNature = require('./../service-providers/georgia-nature.jpg');

interface PublicOfferingDetailsHeaderProps {
  offering: Offering;
}

export const PublicOfferingDetailsHeader: FunctionComponent<PublicOfferingDetailsHeaderProps> = ({
  offering,
}) => {
  const context = {
    offering: (
      <h2 className="publicOfferingDetailsHeader__card__info__header">
        {offering.name}
      </h2>
    ),
    customer: (
      <Link
        state="marketplace-service-provider.details"
        params={{ uuid: offering.customer_uuid }}
      >
        {offering.customer_name}
      </Link>
    ),
  };
  return (
    <div
      className="publicOfferingDetailsHeader"
      style={{
        backgroundImage: `url(${offering.customer_image || GeorgiaNature})`,
      }}
    >
      <div className="publicOfferingDetailsHeader__card">
        <div className="publicOfferingDetailsHeader__card__info">
          {translate('{offering} by {customer}', context, formatJsxTemplate)}
          <div className="publicOfferingDetailsHeader__card__info__description">
            <FormattedHtml html={offering.description} />
          </div>
          <div className="publicOfferingDetailsHeader__card__info__button m-t-sm">
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
        <Logo
          image={offering.thumbnail}
          placeholder={offering.name[0]}
          height={112}
          width={112}
        />
      </div>
    </div>
  );
};
