import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Card, CardContent } from 'waldur-ui';

import { CodePreview } from '@/core/CodePreview';
import { translate } from '@/i18n';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingGettingStartedProps {
  offering: Offering;
}

export const PublicOfferingGettingStarted: FunctionComponent<
  PublicOfferingGettingStartedProps
> = ({ offering }) => (
  <Card bordered className="mb-8" id="getting-started">
    <CardContent>
      <PublicOfferingCardTitle>
        {translate('Getting started')}
      </PublicOfferingCardTitle>
      <CodePreview template={offering.getting_started} context={{}} />
    </CardContent>
  </Card>
);
