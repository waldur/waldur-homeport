import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { PageBarProvider } from '@waldur/marketplace/context';
import { HidableWrapper } from '@waldur/marketplace/resources/details/ResourceDetailsView';

import { Call } from '../types';

import { CallDescriptionCard } from './CallDescriptionCard';
import { CallDocumentsCard } from './CallDocumentsCard';
import { CallOfferingsCard } from './CallOfferingsCard';
import { CallRoundsList } from './CallRoundsList';
import { PublicCallDetailsBar } from './PublicCallDetailsBar';
import { PublicCallDetailsHero } from './PublicCallDetailsHero';

interface PublicCallDetailsProps {
  call: Call;
  refreshCall;
}

export const PublicCallDetails: FunctionComponent<PublicCallDetailsProps> = ({
  call,
}) => {
  const { params } = useCurrentStateAndParams();
  const activeTab = params['#'];
  return (
    <PageBarProvider>
      <div className="m-b">
        <PublicCallDetailsHero call={call} />
        <PublicCallDetailsBar />
        <div className="container-xxl py-10">
          <HidableWrapper activeTab={activeTab} tabKey="description">
            <CallDescriptionCard call={call} />
          </HidableWrapper>
          <HidableWrapper activeTab={activeTab} tabKey="rounds">
            <CallRoundsList call={call} />
          </HidableWrapper>
          <HidableWrapper activeTab={activeTab} tabKey="documents">
            <CallDocumentsCard call={call} />
          </HidableWrapper>
          <HidableWrapper activeTab={activeTab} tabKey="offerings">
            <CallOfferingsCard call={call} />
          </HidableWrapper>
        </div>
      </div>
    </PageBarProvider>
  );
};
