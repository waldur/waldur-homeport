import { FunctionComponent, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@/booking/constants';
import { isEmpty } from '@/core/utils';
import { translate } from '@/i18n';
import { AttributesList } from '@/marketplace/offerings/details/AttributesList';
import { PublicOfferingAttributesSection } from '@/marketplace/offerings/details/PublicOfferingAttributesSection';
import { isValidAttribute } from '@/marketplace/offerings/details/utils';
import { Category } from '@/marketplace/types';

import './PublicOfferingAttributes.scss';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingAttributesProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingAttributesCard: FunctionComponent<
  PublicOfferingAttributesProps
> = ({ offering, category }) => {
  const hasValidAttributes = useMemo(() => {
    if (!category.sections.length || isEmpty(offering.attributes)) {
      return false;
    }
    return category.sections.some((section) =>
      section.attributes.some(
        (attr) =>
          Object.prototype.hasOwnProperty.call(offering.attributes, attr.key) &&
          isValidAttribute(offering.attributes[attr.key]),
      ),
    );
  }, [offering, category]);

  const show = useMemo(
    () =>
      !!offering.datacite_doi ||
      offering.citation_count >= 0 ||
      (!!offering.google_calendar_link &&
        offering.type === OFFERING_TYPE_BOOKING) ||
      hasValidAttributes,
    [offering, hasValidAttributes],
  );
  if (!show) {
    return null;
  }
  return (
    <Card className="card-bordered">
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
