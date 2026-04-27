import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { CodePreview } from '@/core/CodePreview';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingGettingStartedProps {
  offering: Offering;
}

export const PublicOfferingGettingStarted: FunctionComponent<
  PublicOfferingGettingStartedProps
> = ({ offering }) => (
  <Card className="card-bordered mb-10" id="getting-started">
    <Card.Body>
      <PublicOfferingCardTitle>
        {translate('Getting started')}
      </PublicOfferingCardTitle>
      <CodePreview template={offering.getting_started} context={{}} />
    </Card.Body>
  </Card>
);
