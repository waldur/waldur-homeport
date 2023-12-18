import { FunctionComponent } from 'react';

import { PageBarProvider } from '@waldur/marketplace/context';

import { ProposalCall } from '../types';

import { CallDescriptionCard } from './CallDescriptionCard';
import { CallDetailsCard } from './CallDetailsCard';
import { CallDocumentsCard } from './CallDocumentsCard';
import { CallOfferingsCard } from './CallOfferingsCard';
import { PublicCallDetailsBar } from './PublicCallDetailsBar';
import { PublicCallDetailsHero } from './PublicCallDetailsHero';

interface PublicCallDetailsProps {
  call: ProposalCall;
  refreshCall;
}

export const PublicCallDetails: FunctionComponent<PublicCallDetailsProps> = ({
  call,
}) => {
  return (
    <PageBarProvider>
      <div className="publicCallDetails m-b">
        <PublicCallDetailsHero call={call} />
        <PublicCallDetailsBar />
        <div className="container-xxl py-10">
          <CallDetailsCard call={call} />
          <CallDescriptionCard call={call} />
          <CallDocumentsCard />
          <CallOfferingsCard call={call} />
        </div>
      </div>
    </PageBarProvider>
  );
};
