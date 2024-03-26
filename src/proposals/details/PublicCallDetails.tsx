import { FunctionComponent } from 'react';

import { PageBarProvider } from '@waldur/marketplace/context';

import { Call } from '../types';

import { CallDescriptionCard } from './CallDescriptionCard';
import { CallDetailsCard } from './CallDetailsCard';
import { CallDocumentsCard } from './CallDocumentsCard';
import { CallOfferingsCard } from './CallOfferingsCard';
import { PublicCallDetailsBar } from './PublicCallDetailsBar';
import { PublicCallDetailsHero } from './PublicCallDetailsHero';

interface PublicCallDetailsProps {
  call: Call;
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
          <CallDocumentsCard call={call} />
          <CallOfferingsCard call={call} />
        </div>
      </div>
    </PageBarProvider>
  );
};
