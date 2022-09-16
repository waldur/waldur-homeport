import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingGettingStartedProps {
  offering: Offering;
}

export const PublicOfferingGettingStarted: FunctionComponent<PublicOfferingGettingStartedProps> =
  ({ offering }) => (
    <Card className="mb-10" id="getting-started">
      <Card.Body>
        <PublicOfferingCardTitle>
          {translate('Getting started')}
        </PublicOfferingCardTitle>
        {/* TODO: Replace with getting started content */}
        <FormattedHtml html={offering.full_description} />
      </Card.Body>
    </Card>
  );
