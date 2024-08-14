import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';

import { PublicOfferingAttributesCard } from './PublicOfferingAttributesCard';
import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingInfoProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingInfo: FunctionComponent<PublicOfferingInfoProps> = ({
  offering,
  category,
}) => {
  return (
    <Card className="mb-10" id="getting-started">
      <Card.Body>
        <PublicOfferingCardTitle>
          {translate('Description')}
        </PublicOfferingCardTitle>
        <FormattedHtml html={offering.full_description} />
        <PublicOfferingAttributesCard offering={offering} category={category} />
      </Card.Body>
    </Card>
  );
};
