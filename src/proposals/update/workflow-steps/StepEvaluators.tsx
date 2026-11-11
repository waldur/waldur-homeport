import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, FC, ReactNode, useCallback, useMemo } from 'react';
import {
  CallWorkflowStep,
  WorkflowStepResponsibleUser,
} from 'waldur-js-client';

import { Badge, BaseButton, EmptyState } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { InvitationCreateButton } from '@/invitations/actions/create/InvitationCreateButton';
import { useCreateInvitation } from '@/invitations/actions/useCreateInvitation';
import { useModal } from '@/modal/actions';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useCallProposalRoles } from '@/proposals/proposal-roles/queries';
import { AddUserButton } from '@/proposals/team/AddUserButton';
import { Call } from '@/proposals/types';
import {
  canManageCallReviews,
  canReadCallReviewers,
  getCallReadOnlyReason,
} from '@/proposals/utils';
import { stepName } from '@/proposals/workflow/constants';
import {
  callWorkflowCheckKey,
  callWorkflowDescriptionKey,
  callWorkflowHistoryKey,
} from '@/proposals/workflow-description/queries';
import { ActionsMenu } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';
import { useUser } from '@/workspace/hooks';

const DirectEmailInviteDialog = lazyComponent(() =>
  import('@/proposals/manage/reviewer-discovery/DirectEmailInviteDialog').then(
    (m) => ({ default: m.DirectEmailInviteDialog }),
  ),
);

/**
 * What the steps table knows that a step's expanded row needs to manage the
 * people on it: the call, its other steps (to name the step assigning an
 * evaluator role) and whether the call may be changed.
 */
export interface WorkflowStepsContextValue {
  call?: Call;
  steps: CallWorkflowStep[];
  isReadOnly?: boolean;
  viewOnly?: boolean;
}

export const WorkflowStepsContext = createContext<WorkflowStepsContextValue>({
  steps: [],
});

/**
 * Where the people on a step come from, which decides where they are
 * managed: the call's Team tab (call managers, panel members and the panel
 * chair picked among them), the reviewer pool, the provider of each offering,
 * an assignment on each proposal, or the proposal itself.
 */
type EvaluatorSource =
  | 'call_manager'
  | 'panel_member'
  | 'panel_chair'
  | 'reviewer'
  | 'offering_team'
  | 'proposal_role'
  | 'applicant';

type Part = 'completes' | 'contributes';

interface EvaluatorGroup {
  part: Part;
  source: EvaluatorSource;
  /** The evaluator role, for a proposal_role source. */
  roleUuid?: string | null;
  /** Assigned to each proposal from the pool rather than the whole pool. */
  assigned?: boolean;
  users: WorkflowStepResponsibleUser[];
}

interface EvaluatorRow {
  part: Part;
  source: EvaluatorSource;
  user: WorkflowStepResponsibleUser;
}

const COMPLETER_SOURCES: Record<string, EvaluatorSource> = {
  call_manager: 'call_manager',
  panel_member: 'panel_member',
  panel_chair: 'panel_chair',
  reviewer: 'reviewer',
  offering_manager: 'offering_team',
  proposal_role: 'proposal_role',
  applicant: 'applicant',
};

const contributorGroup = (step: CallWorkflowStep): EvaluatorGroup | null => {
  const value = step.contributor_source || 'none';
  const users = step.contributing_users ?? [];
  if (value === 'requested_offering_team') {
    return { part: 'contributes', source: 'offering_team', users };
  }
  if (value === 'assigned_reviewers') {
    return { part: 'contributes', source: 'reviewer', assigned: true, users };
  }
  if (value.startsWith('call_role:')) {
    const source = COMPLETER_SOURCES[value.slice('call_role:'.length)];
    return source ? { part: 'contributes', source, users } : null;
  }
  if (value.startsWith('proposal_role:')) {
    return {
      part: 'contributes',
      source: 'proposal_role',
      roleUuid: step.contributor_proposal_role_uuid,
      users: [],
    };
  }
  return null;
};

/**
 * The groups of people on a step: those completing it and, when its
 * contributor source names other people, those contributing to it.
 */
const getEvaluatorGroups = (step: CallWorkflowStep): EvaluatorGroup[] => {
  const groups: EvaluatorGroup[] = [];
  const completer = COMPLETER_SOURCES[step.completer as string];
  if (completer) {
    groups.push({
      part: 'completes',
      source: completer,
      roleUuid: step.completer_proposal_role,
      users: step.responsible_users ?? [],
    });
  }
  const contributors = contributorGroup(step);
  if (
    contributors &&
    !groups.some(
      (group) =>
        group.source === contributors.source &&
        (group.roleUuid ?? null) === (contributors.roleUuid ?? null),
    )
  ) {
    groups.push(contributors);
  }
  return groups;
};

const HAS_PEOPLE: EvaluatorSource[] = [
  'call_manager',
  'panel_member',
  'panel_chair',
  'reviewer',
  'offering_team',
];

const partLabel = (part: Part) =>
  part === 'completes'
    ? translate('Completes the step')
    : translate('Contributes');

const sourceLabel = (source: EvaluatorSource) =>
  ({
    call_manager: translate('Call manager'),
    panel_member: translate('Panel member'),
    panel_chair: translate('Panel member'),
    reviewer: translate('Reviewer pool'),
    offering_team: translate('Offering team'),
    proposal_role: translate('Evaluator role'),
    applicant: translate('Applicant'),
  })[source];

/** What an empty group of a source lacks, in a sentence. */
const emptyNote = (source: EvaluatorSource) =>
  ({
    call_manager: translate('The call has no managers yet.'),
    panel_member: translate('The call has no panel members yet.'),
    panel_chair: translate(
      'The call has neither a panel chair nor a vice-chair yet.',
    ),
    reviewer: translate(
      "No reviewer has accepted to join the call's pool yet.",
    ),
    offering_team: translate(
      'No offering accepted into the call has an offering manager yet.',
    ),
  })[source];

const TeamTabLink: FC = () => (
  <Link
    state="protected-call.main"
    params={{ tab: 'team' }}
    label={translate('Open the Team tab')}
  />
);

// The pool's tab is only there for those who may read the pool.
const ReviewerPoolLink: FC<{ call?: Call }> = ({ call }) => {
  const user = useUser();
  return canReadCallReviewers(user, call) ? (
    <Link
      state="protected-call.manage"
      params={{ tab: 'reviewer-pool' }}
      label={translate('Open the reviewer pool')}
    />
  ) : null;
};

const roleName = (
  roleUuid: string | null | undefined,
  step: CallWorkflowStep,
  roles: { uuid: string; name: string }[] | undefined,
) =>
  roles?.find((role) => role.uuid === roleUuid)?.name ??
  (roleUuid && roleUuid === step.completer_proposal_role
    ? step.completer_proposal_role_name
    : null);

const assigningSteps = (roleUuid: string, steps: CallWorkflowStep[]) =>
  steps
    .filter((other) => (other.assigns_roles ?? []).includes(roleUuid))
    .map(stepName);

/** Where the people of a group come from and who manages them, in a line. */
const GroupNote: FC<{
  group: EvaluatorGroup;
  step: CallWorkflowStep;
  steps: CallWorkflowStep[];
  roles?: { uuid: string; name: string }[];
  call?: Call;
}> = ({ group, step, steps, roles, call }) => {
  switch (group.source) {
    case 'call_manager':
      return (
        <>
          {translate("The call's managers, managed in its Team tab.")}{' '}
          <TeamTabLink />
        </>
      );
    case 'panel_member':
      return (
        <>
          {translate(
            "The call's panel members, managed in its Team tab. A seat on a panel in the Panels tab grants nothing by itself.",
          )}{' '}
          <TeamTabLink />
        </>
      );
    case 'panel_chair':
      return (
        <>
          {translate(
            "The call's panel chair and vice-chair, picked among its panel members in the Team tab.",
          )}{' '}
          <TeamTabLink />
        </>
      );
    case 'reviewer':
      return (
        <>
          {group.assigned
            ? translate(
                "Reviewers assigned to each proposal from the call's reviewer pool.",
              )
            : translate(
                "The reviewers who accepted to join the call's pool.",
              )}{' '}
          <ReviewerPoolLink call={call} />
        </>
      );
    case 'offering_team':
      return (
        <>
          {step.per_requested_offering
            ? translate(
                'The team of each requested offering, one contribution per offering. Each offering’s provider manages its team in the marketplace; the call cannot invite them.',
              )
            : translate(
                'The managers of the offerings accepted into the call. Each offering’s provider manages its team in the marketplace; the call cannot invite them.',
              )}
        </>
      );
    case 'proposal_role': {
      const name =
        roleName(group.roleUuid, step, roles) ?? translate('an evaluator role');
      const assigning = group.roleUuid
        ? assigningSteps(group.roleUuid, steps)
        : [];
      return (
        <>
          {assigning.length
            ? translate(
                'Whoever holds the role \u201c{role}\u201d on each proposal, assigned there by the step \u201c{steps}\u201d. Nobody is invited at the call level.',
                { role: name, steps: assigning.join(', ') },
              )
            : translate(
                'Whoever holds the role \u201c{role}\u201d on each proposal. No step of the call assigns it, so the call\u2019s managers assign it on each proposal.',
                { role: name },
              )}
        </>
      );
    }
    case 'applicant':
      return <>{translate('The applicant of each proposal.')}</>;
  }
};

/** The offerings an offering manager stands for, linked where the viewer manages their team. */
const OfferingsCell: FC<{ user: WorkflowStepResponsibleUser }> = ({ user }) => {
  const viewer = useUser();
  const offerings = user.offerings ?? [];
  if (!offerings.length) return <>{sourceLabel('offering_team')}</>;
  return (
    <div className="flex flex-col">
      {offerings.map((offering) =>
        hasPermission(viewer, {
          permission: PermissionEnum.CREATE_OFFERING_PERMISSION,
          offeringId: offering.uuid,
          customerId: offering.customer_uuid,
        }) ? (
          <Link
            key={offering.uuid}
            state="marketplace-offering-details"
            params={{
              uuid: offering.customer_uuid,
              offering_uuid: offering.uuid,
              tab: 'permissions',
            }}
            label={offering.name}
          />
        ) : (
          <span key={offering.uuid}>{offering.name}</span>
        ),
      )}
    </div>
  );
};

const RoleBadges: FC<{ user: WorkflowStepResponsibleUser }> = ({ user }) => (
  <div className="flex flex-wrap gap-1">
    {user.is_panel_chair && (
      <Badge variant="primary" size="sm" shape="pill" tone="outline">
        {translate('Chair')}
      </Badge>
    )}
    {user.is_panel_vice_chair && (
      <Badge variant="primary" size="sm" shape="pill" tone="outline">
        {translate('Vice-chair')}
      </Badge>
    )}
  </div>
);

/** Add a call manager or a panel member: invite by mail, or pick a user. */
const CallRoleMenu: FC<{
  call: Call;
  role: string;
  label: string;
  refetch(): void;
  disabledReason?: string;
}> = ({ call, role, label, refetch, disabledReason }) => {
  const context = useMemo(
    () => ({
      scope: call,
      roles: [role],
      roleTypes: ['call', 'call_organizer'] as any,
    }),
    [call, role],
  );
  const invitation = useCreateInvitation({ ...context, refetch });
  return (
    <ActionsMenu
      toggle="labeled"
      label={label}
      variant="primary"
      size="md"
      toggleClassName=""
      side="bottom"
      align="end"
      disabled={Boolean(disabledReason)}
      tooltip={disabledReason}
    >
      <InvitationCreateButton {...context} refetch={refetch} />
      <AddUserButton
        {...context}
        refetch={refetch}
        onInviteByMail={invitation.canInvite ? invitation.callback : undefined}
      />
    </ActionsMenu>
  );
};

const InviteReviewerAction: FC<{
  call: Call;
  refetch(): void;
  disabledReason?: string;
}> = ({ call, refetch, disabledReason }) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      label={translate('Invite reviewer')}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
      variant="primary"
      disabled={Boolean(disabledReason)}
      disabledReason={disabledReason}
      onClick={() =>
        openDialog(DirectEmailInviteDialog, {
          resolve: { call, refetch },
          size: 'lg',
        })
      }
    />
  );
};

/** The one action each source offers at the call level, if any. */
const SourceAction: FC<{
  source: EvaluatorSource;
  call: Call;
  refetch(): void;
  disabledReason?: string;
}> = ({ source, call, refetch, disabledReason }) => {
  const user = useUser();
  switch (source) {
    case 'call_manager':
      return (
        <CallRoleMenu
          call={call}
          role={RoleEnum.CALL_MANAGER}
          label={translate('Add call manager')}
          refetch={refetch}
          disabledReason={disabledReason}
        />
      );
    case 'panel_member':
    case 'panel_chair':
      return (
        <CallRoleMenu
          call={call}
          role={RoleEnum.CALL_PANEL_MEMBER}
          label={translate('Add panel member')}
          refetch={refetch}
          disabledReason={disabledReason}
        />
      );
    case 'reviewer':
      // Inviting to the pool is the reviews manager's: hidden from others.
      return canManageCallReviews(user, call) ? (
        <InviteReviewerAction
          call={call}
          refetch={refetch}
          disabledReason={disabledReason}
        />
      ) : null;
    default:
      return null;
  }
};

const actionKey = (source: EvaluatorSource) =>
  source === 'panel_chair' ? 'panel_member' : source;

interface StepEvaluatorsProps {
  step: CallWorkflowStep;
  /** Reloads the steps, whose people and staffing warning follow. */
  refetch?(): void;
}

/**
 * Who completes and contributes to a step, and where they are managed: an
 * action for the sources the call manages itself, a line saying who
 * manages the others.
 */
export const StepEvaluators: FC<
  StepEvaluatorsProps & WorkflowStepsContextValue
> = ({ step, refetch, call, steps, isReadOnly, viewOnly }) => {
  const groups = useMemo(() => getEvaluatorGroups(step), [step]);
  const usesRoles = groups.some((group) => group.source === 'proposal_role');
  const { data: roles } = useCallProposalRoles(
    call?.uuid,
    usesRoles && !viewOnly,
  );

  const queryClient = useQueryClient();
  const callUuid = call?.uuid;
  const refresh = useCallback(() => {
    refetch?.();
    if (!callUuid) return;
    for (const queryKey of [
      callWorkflowDescriptionKey(callUuid),
      callWorkflowCheckKey(callUuid),
      callWorkflowHistoryKey(callUuid),
    ]) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [refetch, queryClient, callUuid]);

  const tableGroups = useMemo(
    () => groups.filter((group) => HAS_PEOPLE.includes(group.source)),
    [groups],
  );
  const rows = useMemo<EvaluatorRow[]>(
    () =>
      tableGroups.flatMap((group) =>
        group.users.map((user) => ({
          part: group.part,
          source: group.source,
          user,
        })),
      ),
    [tableGroups],
  );
  const tableProps = useRowsTable<EvaluatorRow>(
    `StepEvaluators-${step.uuid}`,
    rows,
    step,
  );

  const hasBadges = rows.some(
    (row) => row.user.is_panel_chair || row.user.is_panel_vice_chair,
  );
  const columns: Column<EvaluatorRow>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <span className="font-medium text-primary">
          {row.user.full_name || row.user.username}
        </span>
      ),
    },
    {
      title: translate('Email or username'),
      render: ({ row }) => (
        <span className="text-quaternary">
          {row.user.email || row.user.username}
        </span>
      ),
    },
    ...(hasBadges
      ? [
          {
            title: translate('Role'),
            render: ({ row }) => <RoleBadges user={row.user} />,
          } as Column<EvaluatorRow>,
        ]
      : []),
    {
      title: translate('Source'),
      render: ({ row }) =>
        row.source === 'offering_team' ? (
          <OfferingsCell user={row.user} />
        ) : (
          sourceLabel(row.source)
        ),
    },
  ];

  // Headed by part only when both parts have people to list.
  const grouped = new Set(rows.map((row) => row.part)).size > 1;
  const rowGroupHeader = grouped
    ? ({ row, rowIndex, rows: pageRows }) =>
        rowIndex === 0 || pageRows[rowIndex - 1].part !== row.part ? (
          <span className="font-semibold">{partLabel(row.part)}</span>
        ) : null
    : undefined;

  const disabledReason = isReadOnly ? getCallReadOnlyReason(call) : undefined;
  const actionSources = Array.from(
    new Set(groups.map((group) => actionKey(group.source))),
  ) as EvaluatorSource[];
  const actions: ReactNode[] =
    call && !viewOnly
      ? actionSources.map((source) => (
          <SourceAction
            key={source}
            source={source}
            call={call}
            refetch={refresh}
            disabledReason={disabledReason}
          />
        ))
      : [];

  const notes = (
    <ul className="list-unstyled text-quaternary mb-0">
      {groups.map((group) => (
        <li key={group.part} className="mb-1">
          {groups.length > 1 && (
            <span className="font-semibold text-secondary">
              {partLabel(group.part)}:{' '}
            </span>
          )}
          <GroupNote
            group={group}
            step={step}
            steps={steps}
            roles={roles}
            call={call}
          />
          {HAS_PEOPLE.includes(group.source) && !group.users.length && (
            <EmptyState
              size="sm"
              className="mt-1"
              message={emptyNote(group.source)}
            />
          )}
        </li>
      ))}
    </ul>
  );
  const toolbar = actions.length ? (
    <div className="flex flex-wrap gap-1.5">{actions}</div>
  ) : null;

  // Nobody named holds the step. The applicant needs no word here -- the
  // step's Responsible role says it -- and every other source says, as an
  // empty state, who holds it instead or how to add them.
  if (!rows.length) {
    const told = groups.filter((group) => group.source !== 'applicant');
    return told.length ? (
      <section className="mt-5" data-testid="step-evaluators">
        {told.map((group) => (
          <EmptyState
            key={group.part}
            message={
              HAS_PEOPLE.includes(group.source) ? (
                emptyNote(group.source)
              ) : (
                <GroupNote
                  group={group}
                  step={step}
                  steps={steps}
                  roles={roles}
                  call={call}
                />
              )
            }
            action={HAS_PEOPLE.includes(group.source) ? toolbar : undefined}
          />
        ))}
      </section>
    ) : null;
  }

  return (
    <section className="mt-5" data-testid="step-evaluators">
      {/* One card round a title row and the table, as a nested table is
          drawn (ResourceProjectExpandable). */}
      <div className="overflow-hidden rounded-md border border-secondary">
        <div className="flex flex-wrap items-start justify-between gap-2.5 px-6 py-2.5 border-b border-b-secondary">
          <div>
            <div className="text-base font-medium text-primary">
              {translate('Evaluators')}
            </div>
            {notes}
          </div>
          {toolbar}
        </div>
        <Table<EvaluatorRow>
          {...tableProps}
          columns={columns}
          verboseName={translate('evaluators')}
          rowGroupHeader={rowGroupHeader}
          placeholderHasRetry={false}
          minHeight="auto"
          hideTitle
          hasActionBar={false}
          cardBordered={false}
          bodyClassName="p-0"
        />
      </div>
    </section>
  );
};
