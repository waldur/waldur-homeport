import { WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { proposalProtectedCallsRetrieve } from 'waldur-js-client';

import { FeaturedIcon } from '@/core/FeaturedIcon';
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
import { useCallBreadcrumbItems } from '../utils';

import { ApplicantVisibilitySection } from './applicant-visibility/ApplicantVisibilitySection';
import { CallActions } from './CallActions';
import { CallUpdateHero } from './CallUpdateHero';
import { COISettingsSection } from './coi-settings/COISettingsSection';
import { CallResourceTemplates } from './configuration/CallResourceTemplates';
import { GeneralConfigurationSection } from './configuration/GeneralConfigurationSection';
import { CallDocumentsSection } from './documents/CallDocumentsSection';
import { CallGeneralSection } from './general/CallGeneralSection';
import { MatchingSection } from './matching/MatchingSection';
import { CallOfferingsSection } from './offerings/CallOfferingsSection';
import { CallRoleMappingsList } from './role-mapping/CallRoleMappingsList';
import { CallRoundsList } from './rounds/CallRoundsList';
import { WorkflowStepsSection } from './workflow-steps/WorkflowStepsSection';

const PageHero = ({ call, refetch }) => (
  <>
    {/* FeaturedIcon is used inline in the warning banner, not as an icon component.
       The WarningCircleIcon weight is set on the component import, not the JSX prop. */}
    {/* eslint-disable waldur-custom/enforce-featured-icon, waldur-custom/enforce-phosphor-icon-weight */}
    {call.state === 'archived' && (
      <div className="d-flex align-items-center gap-3 bg-light-warning text-warning border-bottom py-3 px-8">
        <FeaturedIcon
          IconComponent={WarningCircleIcon}
          size="sm"
          variant="warning"
        />
        <div className="flex-grow-1">
          <span className="fw-semibold">
            {translate('This call is archived and read-only.')}
          </span>{' '}
          <span>
            {translate(
              'All items can be browsed, but not edited. To make changes, activate the call first.',
            )}
          </span>
        </div>
        <CallActions call={call} refetch={refetch} />
      </div>
    )}
    {/* Re-enable lint rules after the archived banner section */}
    {/* eslint-enable waldur-custom/enforce-featured-icon, waldur-custom/enforce-phosphor-icon-weight */}
    <div className="container-fluid my-5">
      <CallTabs call={call} />
      <CallUpdateHero call={call} refetch={refetch} />
    </div>
  </>
);

const Body = ({ call, refetch, loading }) => {
  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        {
          key: 'general',
          title: translate('General'),
          component: CallGeneralSection,
        },
        {
          // Parent has no `component`, so it renders as a dropdown whose
          // children each map to ?tab=<child key> (see usePageTabsTransmitter).
          key: 'configuration',
          title: translate('Configuration'),
          defaultKey: 'general-config',
          children: [
            {
              key: 'general-config',
              title: translate('General configuration'),
              component: GeneralConfigurationSection,
            },
            {
              key: 'applicant-visibility',
              title: translate('Applicant data visibility'),
              component: ApplicantVisibilitySection,
            },
            {
              key: 'resource-templates',
              title: translate('Resource templates'),
              component: CallResourceTemplates,
            },
            {
              key: 'steps-settings',
              title: translate('Steps & settings'),
              component: WorkflowStepsSection,
            },
          ],
        },
        {
          key: 'rounds',
          title: (
            <>
              {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
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
              roles={[RoleEnum.CALL_MANAGER, RoleEnum.CALL_PANEL_MEMBER]}
              roleTypes={['call', 'call_organizer']}
              title={translate('Call team')}
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

  // Read-only mirrors what the backend actually enforces: only an archived
  // call is frozen server-side (StateValidator(draft, active) on the call
  // update + per-nested-surface archived guards). Draft and active calls are
  // fully editable. The one field-level exception the backend still enforces
  // is applied inside the General/Configuration sections: the slug-template
  // and compliance-checklist fields are locked once proposals exist
  // (call.has_proposals).
  const isReadOnly = call.state === 'archived';

  return (
    <Component
      call={call}
      refetch={refetch}
      loading={loading}
      isReadOnly={isReadOnly}
    />
  );
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
        (r) => r.data,
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
