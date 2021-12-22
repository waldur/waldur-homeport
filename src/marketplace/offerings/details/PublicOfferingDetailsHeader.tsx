import { FunctionComponent } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';
import { Offering } from '@waldur/marketplace/types';

import './PublicOfferingDetailsHeader.scss';
import { PublicOfferingEditorButton } from './PublicOfferingEditorButton';

const GeorgiaNature = require('./../service-providers/georgia-nature.jpg');

interface PublicOfferingDetailsHeaderProps {
  offering: Offering;
  refreshOffering;
}

export const PublicOfferingDetailsHeader: FunctionComponent<PublicOfferingDetailsHeaderProps> =
  ({ offering, refreshOffering }) => {
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
          backgroundImage: `url(${offering.image || GeorgiaNature})`,
        }}
      >
        <div className="publicOfferingDetailsHeader__card">
          <div className="publicOfferingDetailsHeader__card__info">
            {translate('{offering} by {customer}', context, formatJsxTemplate)}
            <div className="publicOfferingDetailsHeader__card__info__description">
              <FormattedHtml html={offering.description} />
            </div>
            <div className="m-t-sm">
              <Link
                state="marketplace-offering-user"
                params={{ offering_uuid: offering.uuid }}
                className="btn btn-primary m-r-sm"
              >
                {offering.type === OFFERING_TYPE_BOOKING
                  ? translate('Book')
                  : translate('Purchase')}
              </Link>
              <PublicOfferingEditorButton
                offering={offering}
                refreshOffering={refreshOffering}
              />
            </div>
          </div>
          <Logo
            image={offering.thumbnail}
            placeholder={offering.name[0]}
            height={70}
            width={120}
          />
        </div>
      </div>
    );
  };
