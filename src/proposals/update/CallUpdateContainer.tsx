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
import { CallReviewSection } from './review/CallReviewSection';
import { CallReviewersSection } from './reviewers/CallReviewersSection';
import { CallRoundsSection } from './rounds/CallRoundsSection';

export const CallUpdateContainer: FunctionComponent = () => {
  useFullPage();

  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();

  const { data, isLoading, error } = useQuery(
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
        <CallUpdateHero call={data} />
        <CallUpdateBar call={data} />
        <div className="container-xxl py-10">
          <CallRoundsSection call={data} />
          <CallGeneralSection call={data} />
          <CallDocumentsSection />
          <CallReviewSection call={data} />
          <CallReviewersSection call={data} />
          <CallOfferingsSection call={data} />
        </div>
      </div>
    </PageBarProvider>
  ) : (
    <InvalidRoutePage />
  );
};
