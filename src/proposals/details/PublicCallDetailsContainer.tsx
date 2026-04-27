import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useBreadcrumbs, usePageHero } from '@/navigation/context';
import { useTitle } from '@/navigation/title';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';

import { usePublicCallBreadcrumbItems } from '../utils';

import { CallTabs } from './CallTabs';
import { PublicCallDetailsHero } from './PublicCallDetailsHero';

const CallDescriptionCard = lazyComponent(() =>
  import('./CallDescriptionCard').then((module) => ({
    default: module.CallDescriptionCard,
  })),
);
const CallDocumentsCard = lazyComponent(() =>
  import('./CallDocumentsCard').then((module) => ({
    default: module.CallDocumentsCard,
  })),
);
const CallOfferingsCard = lazyComponent(() =>
  import('./CallOfferingsCard').then((module) => ({
    default: module.CallOfferingsCard,
  })),
);
const CallRoundsList = lazyComponent(() =>
  import('./CallRoundsList').then((module) => ({
    default: module.CallRoundsList,
  })),
);

const tabs: PageBarTab[] = [
  {
    key: 'description',
    title: translate('Description'),
    component: CallDescriptionCard,
  },
  {
    key: 'rounds',
    title: translate('Rounds'),
    component: CallRoundsList,
  },
  {
    key: 'documents',
    title: translate('Documents'),
    component: CallDocumentsCard,
  },
  {
    key: 'offerings',
    title: translate('Offerings'),
    component: CallOfferingsCard,
  },
];

const PageHero = ({ call }) =>
  call ? (
    <div className="container-fluid my-5">
      <CallTabs call={call} />
      <PublicCallDetailsHero call={call} />
    </div>
  ) : null;

export const PublicCallDetailsContainer: FC = () => {
  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();

  const {
    data: call,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['publicCall', call_uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({ path: { uuid: call_uuid } }).then(
        (r) => r.data,
      ),

    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  useTitle(call ? call.name : translate('Call details'));

  usePageHero(<PageHero call={call} />, [call]);

  const breadcrumbItems = usePublicCallBreadcrumbItems(call);
  useBreadcrumbs(breadcrumbItems);

  const filteredTabs = useMemo(
    () =>
      tabs.filter(
        (tab) =>
          !isFeatureVisible(MarketplaceFeatures.call_only) ||
          tab.key !== 'rounds',
      ),
    [tabs],
  );

  const { tabSpec } = usePageTabsTransmitter(filteredTabs);

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : call ? (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refresh={refetch}
          call={call}
          tabSpec={tabSpec}
        />
      )}
    />
  ) : null;
};
