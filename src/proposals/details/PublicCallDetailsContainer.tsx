import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';

import { getPublicCall } from '../api';
import { getCallBreadcrumbItems } from '../utils';

import { CallTabs } from './CallTabs';
import { PublicCallDetailsHero } from './PublicCallDetailsHero';

const CallDescriptionCard = lazyComponent(
  () => import('./CallDescriptionCard'),
  'CallDescriptionCard',
);
const CallDocumentsCard = lazyComponent(
  () => import('./CallDocumentsCard'),
  'CallDocumentsCard',
);
const CallOfferingsCard = lazyComponent(
  () => import('./CallOfferingsCard'),
  'CallOfferingsCard',
);
const CallRoundsList = lazyComponent(
  () => import('./CallRoundsList'),
  'CallRoundsList',
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
    <div className="container-fluid mb-8 mt-6">
      <CallTabs call={call} />
      <PublicCallDetailsHero call={call} />
    </div>
  ) : null;

export const PublicCallDetailsContainer: FunctionComponent = () => {
  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, refreshCall] = useAsyncFn(
    () => getPublicCall(call_uuid),
    [call_uuid],
  );

  useEffectOnce(() => {
    refreshCall();
  });

  useTitle(value ? value.name : translate('Call details'));

  usePageHero(<PageHero call={value} />);

  const breadcrumbItems = useMemo(() => getCallBreadcrumbItems(value), [value]);
  useBreadcrumbs(breadcrumbItems);

  const { tabSpec } = usePageTabsTransmitter(tabs);

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : value ? (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          {...props}
          key={key}
          refresh={refreshCall}
          call={value}
          tabSpec={tabSpec}
        />
      )}
    />
  ) : null;
};
