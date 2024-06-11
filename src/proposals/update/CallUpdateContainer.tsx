import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';
import { RoleEnum } from '@waldur/permissions/enums';

import { getProtectedCall } from '../api';
import { CallBreadcrumbs } from '../details/CallBreadcrumbs';
import { CallTabs } from '../details/CallTabs';
import { TeamSection } from '../team/TeamSection';

import { CallUpdateHero } from './CallUpdateHero';
import { CallDocumentsSection } from './documents/CallDocumentsSection';
import { CallGeneralSection } from './general/CallGeneralSection';
import { CallOfferingsSection } from './offerings/CallOfferingsSection';
import { CallRoundsList } from './rounds/CallRoundsList';

const PageHero = ({ call, refetch }) => (
  <div className="container-fluid mb-8 mt-6">
    <CallTabs call={call} />
    <CallUpdateHero call={call} refetch={refetch} />
  </div>
);

const Body = ({ call, refetch, loading }) => {
  const tabs = useMemo<PageBarTab[]>(
    () => [
      {
        key: 'rounds',
        title: (
          <>
            <ValidationIcon value={call.rounds.length > 0} />
            {translate('Rounds')}
          </>
        ),
        component: CallRoundsList,
      },
      {
        key: 'general',
        title: (
          <>
            <ValidationIcon value={call.description} />
            <span>{translate('General')}</span>
          </>
        ),
        component: CallGeneralSection,
      },
      {
        key: 'documents',
        title: translate('Documents'),
        component: CallDocumentsSection,
      },
      {
        key: 'reviewers',
        title: translate('Reviewers'),
        component: ({ call }) => (
          <TeamSection
            scope={call}
            roles={[RoleEnum.CALL_REVIEWER]}
            roleTypes={['call']}
            title={translate('Reviewers')}
          />
        ),
      },
      {
        key: 'managers',
        title: translate('Managers'),
        component: ({ call }) => (
          <TeamSection
            scope={call}
            roles={[RoleEnum.CALL_MANAGER]}
            roleTypes={['call']}
            title={translate('Managers')}
          />
        ),
      },
      {
        key: 'offerings',
        title: translate('Offerings'),
        component: CallOfferingsSection,
      },
    ],
    [call],
  );

  usePageHero(<PageHero call={call} refetch={refetch} />);

  useBreadcrumbs(<CallBreadcrumbs call={call} />);

  const {
    tabSpec: { component: Component },
  } = usePageTabsTransmitter(tabs);

  return <Component call={call} refetch={refetch} loading={loading} />;
};

export const CallUpdateContainer: FunctionComponent = () => {
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
    <Body refetch={refetch} loading={isRefetching} call={call} />
  ) : (
    <InvalidRoutePage />
  );
};
