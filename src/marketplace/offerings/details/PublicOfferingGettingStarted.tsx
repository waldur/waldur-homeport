import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { CodePreview } from '@waldur/core/CodePreview';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingGettingStartedProps {
  offering: Offering;
}

export const PublicOfferingGettingStarted: FunctionComponent<
  PublicOfferingGettingStartedProps
> = ({ offering }) => (
  <Card className="mb-10" id="getting-started">
    <Card.Body>
      <PublicOfferingCardTitle>
        {translate('Getting started')}
      </PublicOfferingCardTitle>
      <CodePreview template={offering.getting_started} context={{}} />
    </Card.Body>
  </Card>
);
