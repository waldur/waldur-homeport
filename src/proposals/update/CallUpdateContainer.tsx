import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { proposalProtectedCallsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { InvalidRoutePage } from '@/error/InvalidRoutePage';
import { translate } from '@/i18n';
import { ValidationIcon } from '@/marketplace/common/ValidationIcon';
import { useBreadcrumbs, usePageHero } from '@/navigation/context';
import { useTitle } from '@/navigation/title';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { RoleEnum } from '@/permissions/enums';

import { CallTabs } from '../details/CallTabs';
import { TeamSection } from '../team/TeamSection';
import { Call } from '../types';
import { useCallBreadcrumbItems } from '../utils';

import { CallUpdateHero } from './CallUpdateHero';
import { COISettingsSection } from './coi-settings/COISettingsSection';
import { CallConfiguration } from './configuration/CallConfiguration';
import { CallDocumentsSection } from './documents/CallDocumentsSection';
import { CallGeneralSection } from './general/CallGeneralSection';
import { MatchingSection } from './matching/MatchingSection';
import { CallOfferingsSection } from './offerings/CallOfferingsSection';
import { CallRoleMappingsList } from './role-mapping/CallRoleMappingsList';
import { CallRoundsList } from './rounds/CallRoundsList';

const PageHero = ({ call, refetch }) => (
  <div className="container-fluid my-5">
    <CallTabs call={call} />
    <CallUpdateHero call={call} refetch={refetch} />
  </div>
);

const Body = ({ call, refetch, loading }) => {
  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        {
          key: 'general',
          title: (
            <>
              {!call.description && <ValidationIcon value={false} />}
              {translate('General')}
            </>
          ),
          component: CallGeneralSection,
        },
        {
          key: 'configuration',
          title: translate('Configuration'),
          component: CallConfiguration,
        },
        {
          key: 'rounds',
          title: (
            <>
              {!call.rounds.length && <ValidationIcon value={false} />}
              {translate('Rounds')}
            </>
          ),
          component: CallRoundsList,
        },
        {
          key: 'documents',
          title: translate('Documents'),
          component: CallDocumentsSection,
        },
        {
          key: 'offerings',
          title: translate('Offerings'),
          component: CallOfferingsSection,
        },
        {
          key: 'role_mapping',
          title: translate('Role mapping'),
          component: CallRoleMappingsList,
        },
        {
          key: 'coi-settings',
          title: translate('COI settings'),
          component: COISettingsSection,
        },
        {
          key: 'matching',
          title: translate('Matching settings'),
          component: MatchingSection,
        },
        {
          key: 'team',
          title: translate('Team'),
          component: ({ call }) => (
            <TeamSection
              scope={call}
              roles={[RoleEnum.CALL_MANAGER]}
              roleTypes={['call', 'call_organizer']}
              title={translate('Managers')}
            />
          ),
        },
      ].filter(Boolean) as PageBarTab[],
    [call],
  );

  usePageHero(<PageHero call={call} refetch={refetch} />);

  const breadcrumbItems = useCallBreadcrumbItems(call);
  useBreadcrumbs(breadcrumbItems);

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
  } = useQuery({
    queryKey: ['CallUpdateContainer', call_uuid],

    queryFn: () =>
      proposalProtectedCallsRetrieve({ path: { uuid: call_uuid } }).then(
        (r) => r.data as any as Call,
      ),

    refetchOnWindowFocus: false,
  });

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
