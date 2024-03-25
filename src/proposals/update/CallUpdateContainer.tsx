import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { getProtectedCall } from '../api';
import { ReviewersSection } from '../reviewers/ReviewersSection';

import { CallUpdateBar } from './CallUpdateBar';
import { CallUpdateHero } from './CallUpdateHero';
import { CallDocumentsSection } from './documents/CallDocumentsSection';
import { CallGeneralSection } from './general/CallGeneralSection';
import { CallOfferingsSection } from './offerings/CallOfferingsSection';
import { CallRoundsList } from './rounds/CallRoundsList';

export const CallUpdateContainer: FunctionComponent = () => {
  useFullPage();

  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();

  const {
    data: call,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery(
    ['CallUpdateContainer', call_uuid],
    () => getProtectedCall(call_uuid),
    {
      refetchOnWindowFocus: false,
    },
  );

  useTitle(call ? call.name : translate('Call update'));

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : call ? (
    <PageBarProvider>
      <div className="m-b">
        <CallUpdateHero call={call} refetch={refetch} />
        <CallUpdateBar call={call} />
        <div className="container-xxl py-10">
          <CallRoundsList call={call} />
          <CallGeneralSection
            call={call}
            refetch={refetch}
            loading={isRefetching}
          />
          <CallDocumentsSection call={call} refetch={refetch} />
          <ReviewersSection scope={call} roleTypes={['call']} />
          <CallOfferingsSection call={call} />
        </div>
      </div>
    </PageBarProvider>
  ) : (
    <InvalidRoutePage />
  );
};
