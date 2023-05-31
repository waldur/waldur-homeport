import { FunctionComponent, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { isEmpty } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { AttributesList } from '@waldur/marketplace/offerings/details/AttributesList';
import { PublicOfferingAttributesSection } from '@waldur/marketplace/offerings/details/PublicOfferingAttributesSection';
import { Category, Offering } from '@waldur/marketplace/types';

import './PublicOfferingAttributes.scss';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingAttributesProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingAttributesCard: FunctionComponent<PublicOfferingAttributesProps> =
  ({ offering, category }) => {
    const show = useMemo(
      () =>
        !!offering.datacite_doi ||
        offering.citation_count >= 0 ||
        (!!offering.google_calendar_link &&
          offering.type === OFFERING_TYPE_BOOKING) ||
        (!!category.sections.length && !isEmpty(offering.attributes)),
      [offering, category],
    );
    if (!show) {
      return null;
    }
    return (
      <Card>
        <Card.Body>
          <PublicOfferingCardTitle>
            {translate('Attributes')}
          </PublicOfferingCardTitle>
          <PublicOfferingAttributesSection offering={offering} />
          <AttributesList
            attributes={offering.attributes}
            sections={category.sections}
          />
        </Card.Body>
      </Card>
    );
  };
