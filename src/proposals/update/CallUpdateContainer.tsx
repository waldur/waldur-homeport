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

import { CallUpdateBar } from './CallUpdateBar';
import { CallUpdateHero } from './CallUpdateHero';
import { CallDocumentsSection } from './documents/CallDocumentsSection';
import { CallGeneralSection } from './general/CallGeneralSection';
import { CallOfferingsSection } from './offerings/CallOfferingsSection';
import { CallReviewersSection } from './reviewers/CallReviewersSection';
import { CallRoundsList } from './rounds/CallRoundsList';

export const CallUpdateContainer: FunctionComponent = () => {
  useFullPage();

  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();

  const { data, isLoading, error, refetch, isRefetching } = useQuery(
    ['CallUpdateContainer', call_uuid],
    () => getProtectedCall(call_uuid),
    {
      refetchOnWindowFocus: false,
    },
  );

  useTitle(data ? data.name : translate('Call update'));

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : data ? (
    <PageBarProvider>
      <div className="m-b">
        <CallUpdateHero call={data} refetch={refetch} />
        <CallUpdateBar call={data} />
        <div className="container-xxl py-10">
          <CallRoundsList call={data} />
          <CallGeneralSection
            call={data}
            refetch={refetch}
            loading={isRefetching}
          />
          <CallDocumentsSection call={data} refetch={refetch} />
          <CallReviewersSection call={data} />
          <CallOfferingsSection call={data} />
        </div>
      </div>
    </PageBarProvider>
  ) : (
    <InvalidRoutePage />
  );
};
