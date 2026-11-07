import {
  CrownSimpleIcon,
  UserMinusIcon,
  UserPlusIcon,
} from '@phosphor-icons/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useRef } from 'react';
import {
  CallProposalRole,
  ProposalRoleAssignment,
  proposalProposalsRevokeRoleAssignment,
  proposalProposalsRoleAssignmentCandidatesList,
  proposalProposalsSetRoleLead,
} from 'waldur-js-client';

import { AccordionCard, Badge } from 'waldur-ui';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown, ActionsMenu } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import '@/proposals/flushTable.scss';

import {
  moveLeadRefusal,
  revokeHolderRefusal,
} from '../../proposal-roles/access';
import {
  coiStateForOverseers,
  coiStateLabel,
  emptyPoolMessage,
} from '../../proposal-roles/constants';
import {
  MY_PROPOSAL_ROLE_ASSIGNMENTS_KEY,
  proposalRoleAssignmentsKey,
  useProposalRoleAssignments,
} from '../../proposal-roles/queries';
import { Proposal } from '../../types';
import { proposalWorkflowStatesKey } from '../../workflow/queries';
import { sectionOpenProps, useSectionOpenState } from '../sectionOpen';

const AssignEvaluatorDialog = lazyComponent(() =>
  import('./AssignEvaluatorDialog').then((module) => ({
    default: module.AssignEvaluatorDialog,
  })),
);

interface RowActionProps {
  row: ProposalRoleAssignment;
  proposal: Proposal;
  /** Why the viewer may not take this action, when they may not. */
  refusal?: string;
  refetch(): void;
}

const SetLeadAction: FC<RowActionProps> = ({
  row,
  proposal,
  refusal,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsSetRoleLead({
        path: { uuid: proposal.uuid },
        body: { assignment_uuid: row.uuid },
      }),
    refetch,
    successMessage: translate('{name} is now the lead.', {
      name: row.user_full_name,
    }),
    errorMessage: translate('Unable to mark the lead.'),
  });
  return (
    <ActionItem
      title={translate('Mark as lead')}
      action={() => mutate()}
      disabled={isPending || Boolean(refusal)}
      tooltip={refusal}
      iconNode={<CrownSimpleIcon weight="bold" />}
    />
  );
};

const RevokeAction: FC<RowActionProps> = ({
  row,
  proposal,
  refusal,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsRevokeRoleAssignment({
        path: { uuid: proposal.uuid },
        body: { assignment_uuid: row.uuid },
      }),
    refetch,
    confirmation: {
      title: translate('Revoke evaluator'),
      body: translate(
        '{name} will no longer be {role} on this proposal, and loses the access the role gave.',
        { name: row.user_full_name, role: row.role_name },
      ),
      options: { forDeletion: true, positiveButton: translate('Revoke') },
    },
    successMessage: translate('The evaluator has been revoked.'),
    errorMessage: translate('Unable to revoke the evaluator.'),
  });
  return (
    <ActionItem
      title={translate('Revoke')}
      action={() => mutate()}
      disabled={isPending || Boolean(refusal)}
      tooltip={refusal}
      iconNode={<UserMinusIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};

interface ProposalEvaluatorsSectionProps {
  proposal: Proposal;
  roles: CallProposalRole[];
  /** Whether the viewer may assign, revoke and move the lead. */
  canManage: boolean;
  /**
   * Whether the viewer may change any holder and move any lead, as those
   * overseeing the call do; a peer managing the roles in an assignment step
   * takes neither the lead nor anyone else's role.
   */
  changesAnyHolder: boolean;
}

interface RoleSection {
  uuid: string;
  name: string;
  role?: CallProposalRole;
  rows: ProposalRoleAssignment[];
}

/**
 * One section per role: the call's roles for those who manage them, else
 * the roles the viewer can see held.
 */
export const groupByRole = (
  roles: CallProposalRole[],
  rows: ProposalRoleAssignment[],
): RoleSection[] => {
  const sections: RoleSection[] = roles.map((role) => ({
    uuid: role.uuid,
    name: role.name,
    role,
    rows: [],
  }));
  for (const row of rows) {
    let section = sections.find((s) => s.uuid === row.role_uuid);
    if (!section) {
      section = { uuid: row.role_uuid, name: row.role_name, rows: [] };
      sections.push(section);
    }
    section.rows.push(row);
  }
  return sections;
};

/** "1 of 2 required", for a role whose holder counts are known. */
const holdersSummary = (section: RoleSection) => {
  if (!section.role) return null;
  const { min_holders: min, max_holders: max } = section.role;
  const count = section.rows.length;
  if (count < (min ?? 1)) {
    return translate('{count} of {min} required', { count, min: min ?? 1 });
  }
  if (max && count >= max) {
    return translate('Complete');
  }
  return null;
};

interface EvaluatorsHeaderProps {
  proposal: Proposal;
  roles: CallProposalRole[];
  sections: RoleSection[];
  canManage: boolean;
  changesAnyHolder: boolean;
  refetch(): void;
}

/**
 * Why a role cannot be assigned on the proposal yet, per role uuid: nobody
 * is eligible for it -- a role held by the proposal's own reviewers, say,
 * before anyone has reviewed it. Asked of the same list the dialog offers,
 * for those who assign; a role anyone may hold is searched, never empty.
 */
const EVALUATED_STATES = ['submitted', 'in_review'];

const useUnassignableReasons = (
  proposal: Proposal,
  sections: RoleSection[],
): Record<string, string> => {
  const pooled = sections.filter(
    (section) => section.role && section.role.eligible_from !== 'any_user',
  );
  const results = useQueries({
    queries: pooled.map((section) => ({
      queryKey: ['proposalRoleCandidates', proposal.uuid, section.uuid],
      queryFn: () =>
        proposalProposalsRoleAssignmentCandidatesList({
          path: { uuid: proposal.uuid },
          query: { role_uuid: section.uuid },
        }).then((response) => response.data ?? []),
      enabled: EVALUATED_STATES.includes(proposal.state),
      refetchOnWindowFocus: false,
    })),
  });
  const reasons: Record<string, string> = {};
  // Decided, withdrawn or cancelled: nobody evaluates it any more.
  if (!EVALUATED_STATES.includes(proposal.state)) {
    sections.forEach((section) => {
      reasons[section.uuid] = translate(
        'The proposal is no longer being evaluated.',
      );
    });
    return reasons;
  }
  pooled.forEach((section, index) => {
    const data = results[index]?.data;
    if (data && data.length === 0) {
      reasons[section.uuid] =
        emptyPoolMessage(section.role.eligible_from) ||
        translate('Nobody is eligible for this role on this proposal yet.');
    }
  });
  return reasons;
};

/**
 * The panel header's way to assign a role, folded or open: one button for
 * a single role, an "Assign" menu naming each of several.
 */
const EvaluatorsHeader: FC<EvaluatorsHeaderProps> = ({
  proposal,
  roles,
  sections,
  canManage,
  changesAnyHolder,
  refetch,
}) => {
  const user = useUser();
  const { openDialog } = useModal();
  const counted = sections.filter((section) => section.role);
  const resolveFor = (section: RoleSection) => ({
    proposal,
    roles,
    initialRole: section.uuid,
    leadRefusal: (roleUuid: string) =>
      moveLeadRefusal({
        changesAny: changesAnyHolder,
        userUuid: user?.uuid,
        holders: sections.find((s) => s.uuid === roleUuid)?.rows ?? [],
      }),
    refetch,
  });
  const assignable = canManage ? counted : [];
  const unassignable = useUnassignableReasons(proposal, assignable);
  if (!counted.length) return null;
  return (
    <div
      className="flex flex-wrap items-center justify-end gap-2.5"
      data-testid="evaluators-header"
    >
      {assignable.length === 1 ? (
        <CreateModalButton
          dialog={AssignEvaluatorDialog}
          resolve={resolveFor(assignable[0])}
          size="md"
          buttonSize="sm"
          // Outline: the step's Complete is the page's one primary.
          variant="tertiary"
          title={translate('Assign {role}', { role: assignable[0].name })}
          disabled={Boolean(unassignable[assignable[0].uuid])}
          disabledReason={unassignable[assignable[0].uuid]}
        />
      ) : assignable.length > 1 ? (
        <ActionsMenu
          side="bottom"
          toggle="add"
          variant="tertiary"
          label={translate('Assign')}
        >
          {assignable.map((section) => (
            <ActionItem
              key={section.uuid}
              title={translate('Assign {role}', { role: section.name })}
              iconNode={<UserPlusIcon weight="bold" />}
              disabled={Boolean(unassignable[section.uuid])}
              tooltip={unassignable[section.uuid]}
              action={() =>
                openDialog(AssignEvaluatorDialog, {
                  resolve: resolveFor(section),
                  size: 'md',
                })
              }
            />
          ))}
        </ActionsMenu>
      ) : null}
    </div>
  );
};

const coiCell = (row: ProposalRoleAssignment, overseeing: boolean) => {
  // Those overseeing the proposal are told what to do about it; the holder
  // reading their own row, where they stand.
  const label = overseeing ? coiStateForOverseers(row) : coiStateLabel(row);
  // Another holder's conflict-of-interest state is not shown to a holder.
  if (row.coi_confirmation_required === null) return null;
  if (row.has_standing_conflict) {
    return (
      <Badge variant="danger" size="sm" shape="pill" tone="outline">
        {label}
      </Badge>
    );
  }
  return row.awaits_coi_confirmation ? (
    <Badge variant="warning" size="sm" shape="pill" tone="outline">
      {label}
    </Badge>
  ) : (
    <span className="text-quaternary">{label}</span>
  );
};

interface RoleHoldersTableProps {
  proposal: Proposal;
  section: RoleSection;
  /** When the holders were last read; a new value shows them again. */
  version: number;
  canManage: boolean;
  changesAnyHolder: boolean;
  refetch(): void;
}

/** The holders of one role, from the assignments already read. */
const RoleHoldersTable: FC<RoleHoldersTableProps> = ({
  proposal,
  section,
  version,
  canManage,
  changesAnyHolder,
  refetch,
}) => {
  const user = useUser();
  const rowsRef = useRef(section.rows);
  rowsRef.current = section.rows;
  const filter = useMemo(() => ({ version }), [version]);
  const fetchData = useCallback(
    () =>
      Promise.resolve({
        rows: rowsRef.current,
        resultCount: rowsRef.current.length,
      }),
    [],
  );
  const tableProps = useTable({
    table: `ProposalEvaluators-${proposal.uuid}-${section.uuid}`,
    fetchData,
    filter,
  });

  const columns: Column<ProposalRoleAssignment>[] = [
    {
      title: translate('Evaluator'),
      render: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">
            {row.user_full_name}
            {row.is_lead && (
              <Badge
                variant="primary"
                size="sm"
                shape="pill"
                tone="outline"
                className="ms-1.5"
              >
                {translate('Lead')}
              </Badge>
            )}
          </span>
          {row.user_email && (
            <span className="text-quaternary">{row.user_email}</span>
          )}
        </div>
      ),
    },
    {
      title: translate('Conflict of interest'),
      render: ({ row }) => renderFieldOrDash(coiCell(row, canManage)),
    },
    {
      title: translate('Assigned in'),
      render: ({ row }) =>
        renderFieldOrDash(
          row.assigned_in_step_name ??
            (row.assigned_by_full_name
              ? translate('By {name}', { name: row.assigned_by_full_name })
              : null),
        ),
    },
  ];

  return (
    <Table<ProposalRoleAssignment>
      {...tableProps}
      // Framed, but without the card's inner inset: the rows run to the
      // frame, as the other tables on the proposal page do.
      className="proposal-flush-table"
      // As tall as its few holders, not the 300px floor of a page's table.
      minHeight="auto"
      columns={columns}
      verboseName={translate('holders of {role}', { role: section.name })}
      hideTitle
      hasActionBar={false}
      hasPagination={false}
      placeholderHasRetry={false}
      rowActions={
        canManage
          ? ({ row }) => (
              <ActionsDropdown
                row={row}
                refetch={refetch}
                actions={[
                  section.role?.allows_lead && !row.is_lead
                    ? ({ row }) => (
                        <SetLeadAction
                          row={row}
                          proposal={proposal}
                          refusal={moveLeadRefusal({
                            changesAny: changesAnyHolder,
                            userUuid: user?.uuid,
                            holders: section.rows,
                            to: row,
                          })}
                          refetch={refetch}
                        />
                      )
                    : null,
                  ({ row }) => (
                    <RevokeAction
                      row={row}
                      proposal={proposal}
                      refusal={revokeHolderRefusal({
                        changesAny: changesAnyHolder,
                        userUuid: user?.uuid,
                        holder: row,
                      })}
                      refetch={refetch}
                    />
                  ),
                ].filter(Boolean)}
              />
            )
          : undefined
      }
    />
  );
};

/**
 * Who holds the call's evaluator roles on the proposal -- its rapporteurs,
 * say -- one section per role, with their conflict-of-interest state. Never
 * shown to the applicant team: holders are not part of it.
 */
export const ProposalEvaluatorsSection: FC<ProposalEvaluatorsSectionProps> = ({
  proposal,
  roles,
  canManage,
  changesAnyHolder,
}) => {
  const openState = useSectionOpenState();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, dataUpdatedAt } =
    useProposalRoleAssignments(proposal.uuid);

  // The assignment step's gate depends on the holders, so the step actions
  // re-read the workflow after every change; and the viewer may have been
  // given or lost a role of their own.
  const refetch = useCallback(() => {
    for (const queryKey of [
      proposalRoleAssignmentsKey(proposal.uuid),
      proposalWorkflowStatesKey(proposal.uuid),
      [MY_PROPOSAL_ROLE_ASSIGNMENTS_KEY],
    ]) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, proposal.uuid]);

  const sections = useMemo(() => groupByRole(roles, data ?? []), [roles, data]);

  let content;
  if (isLoading) {
    content = <p className="text-quaternary mb-0">{translate('Loading...')}</p>;
  } else if (isError) {
    content = (
      <p className="text-quaternary mb-0">
        {translate('You cannot see who evaluates this proposal.')}
      </p>
    );
  } else if (!sections.length) {
    content = (
      <p className="text-quaternary mb-0">
        {translate('The call has no evaluator roles.')}
      </p>
    );
  } else {
    content = sections.map((section) => (
      <section
        key={section.uuid}
        className="mb-5"
        data-testid={`evaluator-role-${section.uuid}`}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <h4 className="text-sm font-medium mb-0">{section.name}</h4>
          {holdersSummary(section) && (
            <span className="text-quaternary text-xs">
              {holdersSummary(section)}
            </span>
          )}
        </div>
        <RoleHoldersTable
          proposal={proposal}
          section={section}
          version={dataUpdatedAt}
          canManage={canManage}
          changesAnyHolder={changesAnyHolder}
          refetch={refetch}
        />
      </section>
    ));
  }

  return (
    <AccordionCard
      id="step-evaluators"
      title={translate('Evaluators')}
      subtitle={translate(
        'Who evaluates the proposal in the call’s evaluator roles. The applicant does not see them.',
      )}
      actions={
        isLoading || isError ? undefined : (
          <EvaluatorsHeader
            proposal={proposal}
            roles={roles}
            sections={sections}
            canManage={canManage}
            changesAnyHolder={changesAnyHolder}
            refetch={refetch}
          />
        )
      }
      {...sectionOpenProps(openState, 'step-evaluators', true)}
    >
      {content}
    </AccordionCard>
  );
};
