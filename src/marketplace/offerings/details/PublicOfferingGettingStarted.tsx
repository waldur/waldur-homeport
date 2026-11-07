import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { CodePreview } from '@/core/CodePreview';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';

interface PublicOfferingGettingStartedProps {
  offering: Offering;
}

export const PublicOfferingGettingStarted: FunctionComponent<
  PublicOfferingGettingStartedProps
> = ({ offering }) => (
  <Panel
    title={translate('Getting started')}
    cardBordered
    className="mb-8"
    id="getting-started"
  >
    <CodePreview template={offering.getting_started} context={{}} />
  </Panel>
);
