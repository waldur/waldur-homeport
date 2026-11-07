import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';
import { proposalProtectedCallsRetrieve } from 'waldur-js-client';

import { AlertItem, Badge, useBreadcrumbs } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { AccessDeniedPage } from '@/error/AccessDeniedPage';
import { InvalidRoutePage } from '@/error/InvalidRoutePage';
import { translate } from '@/i18n';
import { ValidationIcon } from '@/marketplace/common/ValidationIcon';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { LayoutSlot } from '@/navigation/slots';
import { useTitle } from '@/navigation/title';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { RoleEnum } from '@/permissions/enums';
import { useValidationRedirect } from '@/proposals/validation/useValidationRedirect';
import { useUser } from '@/workspace/hooks';

import { CallTabs } from '../details/CallTabs';
import { SetPanelChairButton } from '../team/SetPanelChairButton';
import { TeamSection } from '../team/TeamSection';
import {
  canOpenCallEditPage,
  canUpdateCall,
  useCallBreadcrumbItems,
} from '../utils';

import { ApplicantVisibilitySection } from './applicant-visibility/ApplicantVisibilitySection';
import { CallActions } from './CallActions';
import { CallUpdateHero } from './CallUpdateHero';
import { COISettingsSection } from './coi-settings/COISettingsSection';
import { AllocationSettingsSection } from './configuration/AllocationSettingsSection';
import { CallResourceTemplates } from './configuration/CallResourceTemplates';
import { GeneralConfigurationSection } from './configuration/GeneralConfigurationSection';
import { ProposalFieldsSection } from './configuration/ProposalFieldsSection';
import { CallDocumentsSection } from './documents/CallDocumentsSection';
import { CallEligibilitySection } from './eligibility/CallEligibilitySection';
import { ReviewerEligibilitySection } from './eligibility/ReviewerEligibilitySection';
import { CallGeneralSection } from './general/CallGeneralSection';
import { MatchingSection } from './matching/MatchingSection';
import { CallOfferingsSection } from './offerings/CallOfferingsSection';
import { CallPanelsSection } from './panels/CallPanelsSection';
import { CallProposalRolesSection } from './proposal-roles/CallProposalRolesSection';
import { CallRoleMappingsList } from './role-mapping/CallRoleMappingsList';
import { CallRoundsList } from './rounds/CallRoundsList';
import { WorkflowStepsSection } from './workflow-steps/WorkflowStepsSection';

const PageHero = ({ call, refetch }) => (
  <>
    {call.state === 'archived' && (
      <AlertItem
        variant="warning"
        iconSize="sm"
        iconClassName="mt-0"
        title={translate('This call is archived and read-only.')}
        body={translate(
          'All items can be browsed, but not edited. To make changes, activate the call first.',
        )}
        actions={<CallActions call={call} refetch={refetch} />}
        className="bg-warning-subtle border-b border-secondary py-2.5 px-6"
      />
    )}
    <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'my-[1.25rem]')}>
      <CallTabs call={call} />
      <CallUpdateHero call={call} refetch={refetch} />
    </div>
  </>
);

const Body = ({ call, refetch, loading }) => {
  const user = useUser();

  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        {
          // A parent without a `component` renders as a dropdown whose
          // children each map to ?tab=<child key> (see usePageTabsTransmitter).
          // The groups follow what is being configured: the call itself,
          // the application form, the resources, the evaluation and the
          // allocation.
          key: 'call',
          title: translate('Call'),
          defaultKey: 'general',
          children: [
            {
              key: 'general',
              title: translate('General'),
              component: CallGeneralSection,
            },
            {
              key: 'general-config',
              title: translate('General configuration'),
              component: GeneralConfigurationSection,
            },
            {
              key: 'documents',
              title: translate('Documents'),
              component: CallDocumentsSection,
            },
          ],
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
          key: 'application',
          title: translate('Application form'),
          defaultKey: 'proposal-fields',
          children: [
            {
              key: 'proposal-fields',
              title: translate('Project details fields'),
              component: ProposalFieldsSection,
            },
            {
              key: 'applicant-eligibility',
              title: translate('Applicant eligibility'),
              component: CallEligibilitySection,
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
          ],
        },
        {
          // The call's offerings and what a proposal may request of each.
          key: 'offerings',
          title: translate('Resources'),
          component: CallOfferingsSection,
        },
        {
          key: 'workflow',
          title: translate('Evaluation workflow'),
          defaultKey: 'steps-settings',
          children: [
            {
              key: 'steps-settings',
              title: translate('Steps & settings'),
              component: WorkflowStepsSection,
            },
            {
              key: 'evaluator-roles',
              title: translate('Evaluator roles'),
              component: CallProposalRolesSection,
            },
            {
              key: 'panels',
              title: translate('Panels'),
              component: CallPanelsSection,
            },
            {
              key: 'coi-settings',
              title: translate('COI settings'),
              component: COISettingsSection,
            },
            {
              key: 'reviewer-eligibility',
              title: translate('Reviewer eligibility'),
              component: ReviewerEligibilitySection,
            },
            {
              key: 'matching',
              title: translate('Matching settings'),
              component: MatchingSection,
            },
          ],
        },
        {
          key: 'allocation',
          title: translate('Allocation'),
          defaultKey: 'allocation-settings',
          children: [
            {
              key: 'allocation-settings',
              title: translate('Allocation settings'),
              component: AllocationSettingsSection,
            },
            {
              key: 'role_mapping',
              title: translate('Role mapping'),
              component: CallRoleMappingsList,
            },
          ],
        },
        {
          key: 'team',
          title: translate('Team'),
          // Deliberately NOT gated on isReadOnly as a whole: managing the call
          // team runs on CALL.CREATE_PERMISSION / UPDATE_PERMISSION /
          // DELETE_PERMISSION, which the backend keeps separate from UPDATE_CALL
          // (ProtectedCallViewSet exempts add_user/update_user/delete_user from
          // its blanket gate so organization owners keep team management), and
          // AddUserButton already checks that set itself. Only the panel-chair
          // actions PATCH the call, so only it follows the call's edit lock --
          // hidden, like Remove for users who may not remove, rather than shown
          // disabled.
          component: ({ call, refetch, isReadOnly }) => (
            <TeamSection
              scope={call}
              // The reviewer role puts its holder in the call's reviewer pool
              // as accepted, and revoking it declines their entry there
              // (reviewer_membership in mastermind).
              roles={[
                RoleEnum.CALL_MANAGER,
                RoleEnum.CALL_PANEL_MEMBER,
                RoleEnum.CALL_REVIEWER,
              ]}
              roleTypes={['call', 'call_organizer']}
              title={translate('Call team')}
              extraRowActions={
                isReadOnly
                  ? undefined
                  : ({ row }) => (
                      <SetPanelChairButton
                        permission={row}
                        call={call}
                        refetch={refetch}
                      />
                    )
              }
              hasExtraRowActions={(row) =>
                row.role_name === RoleEnum.CALL_PANEL_MEMBER
              }
              roleSuffix={(row) =>
                call.panel_chair_uuid &&
                row.user_uuid === call.panel_chair_uuid ? (
                  <Badge
                    variant="primary"
                    size="sm"
                    shape="pill"
                    tone="outline"
                  >
                    {translate('Chair')}
                  </Badge>
                ) : call.panel_vice_chair_uuid &&
                  row.user_uuid === call.panel_vice_chair_uuid ? (
                  <Badge
                    variant="primary"
                    size="sm"
                    shape="pill"
                    tone="outline"
                  >
                    {translate('Vice-chair')}
                  </Badge>
                ) : null
              }
            />
          ),
        },
      ].filter(Boolean) as PageBarTab[],
    [call],
  );

  const breadcrumbItems = useCallBreadcrumbItems(call);
  useBreadcrumbs(breadcrumbItems);

  const {
    tabSpec: { component: Component },
  } = usePageTabsTransmitter(tabs);
  useValidationRedirect();

  const canUpdate = canUpdateCall(user, call);

  // Read-only mirrors what the backend actually enforces: an archived call is
  // frozen server-side (StateValidator(draft, active) on the call update +
  // per-nested-surface archived guards), and every write needs UPDATE_CALL.
  // Draft and active calls are fully editable by a permitted user. The one
  // field-level exception the backend still enforces is applied inside the
  // General/Configuration sections: the slug-template and compliance-checklist
  // fields are locked once proposals exist (call.has_proposals).
  const isReadOnly = call.state === 'archived' || !canUpdate;

  return (
    <>
      <LayoutSlot name="hero">
        <PageHero call={call} refetch={refetch} />
      </LayoutSlot>
      <Component
        call={call}
        refetch={refetch}
        loading={loading}
        isReadOnly={isReadOnly}
      />
    </>
  );
};

export const CallUpdateContainer: FunctionComponent = () => {
  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();
  const user = useUser();

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
    // The route carries no permission guard -- `data.permissions` hooks run
    // against Redux state only, so they cannot answer "may this user edit
    // *this* call". Checked here instead, where the call is in hand.
    canOpenCallEditPage(user, call) ? (
      <Body refetch={refetch} loading={isRefetching} call={call} />
    ) : (
      <AccessDeniedPage />
    )
  ) : (
    <InvalidRoutePage />
  );
};
