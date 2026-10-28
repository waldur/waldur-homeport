import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { CodePreview } from '@/core/CodePreview';
import { translate } from '@/i18n';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingGettingStartedProps {
  offering: Offering;
}

export const PublicOfferingGettingStarted: FunctionComponent<
  PublicOfferingGettingStartedProps
> = ({ offering }) => (
  <div className="card card-bordered mb-8" id="getting-started">
    <div className="card-body">
      <PublicOfferingCardTitle>
        {translate('Getting started')}
      </PublicOfferingCardTitle>
      <CodePreview template={offering.getting_started} context={{}} />
    </div>
  </div>
);
