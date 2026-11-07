import {
  ArrowClockwiseIcon,
  FileTextIcon,
  PencilSimpleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import {
  ProposalRun,
  proposalProposalsOpenFinalReport,
  proposalProposalsSubmitChanges,
  proposalProposalsWithdrawRun,
} from 'waldur-js-client';

import {
  AccordionCard,
  AlertItem,
  BaseButton,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { propVal } from '@/property/propertyFields';
import { Proposal } from '@/proposals/types';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { actsForApplicant, isOnProposalTeam } from '../team/teamRules';

import { changeRequestPartLabel } from './changeRequests';
import {
  canOpenFinalReport,
  canRequestExtension,
  canWithdrawRun,
  isRunGranted,
  POST_AWARD_SECTION_ID,
  postAwardStatusLabel,
  runEditMode,
  runGrantDiffers,
  runPartUnlocked,
  runPhaseLabel,
  runStateLabel,
} from './postAward';
import { proposalRunsKey, useProposalRuns } from './postAwardQueries';
import { sectionOpenProps, useSectionOpenState } from './sectionOpen';

const ProposalRunDialog = lazyComponent(() =>
  import('./ProposalRunDialog').then((module) => ({
    default: module.ProposalRunDialog,
  })),
);

/** What the decision granted, who set it, and whether it is what was asked. */
const GrantedCell: FC<{ row: ProposalRun }> = ({ row }) => (
  <div className="flex flex-col gap-1 items-start">
    <span>
      {renderFieldOrDash(
        row.granted_end_date ? formatDate(row.granted_end_date) : null,
      )}
    </span>
    {runGrantDiffers(row) && (
      <span className="text-warning font-semibold">
        {/* The cell shows the date: say so when only the limits differ. */}
        {(row.granted_end_date ?? null) === (row.requested_end_date ?? null)
          ? translate('Limits differ from the request')
          : translate('Differs from the request')}
      </span>
    )}
    {row.granted_by_name && isRunGranted(row) && (
      <span className="text-quaternary">
        {translate('Granted by {name}', { name: row.granted_by_name })}
      </span>
    )}
  </div>
);

const columns: Column<ProposalRun>[] = [
  {
    title: translate('Run'),
    render: ({ row }) => (
      <span className="font-medium text-primary">
        {runPhaseLabel(row.phase)}
      </span>
    ),
  },
  { title: translate('State'), render: ({ row }) => runStateLabel(row.state) },
  {
    title: translate('Opened'),
    render: ({ row }) => formatDate(row.opened_at),
  },
  {
    title: translate('Asked end date'),
    render: ({ row }) =>
      renderFieldOrDash(
        row.requested_end_date ? formatDate(row.requested_end_date) : null,
      ),
  },
  {
    title: translate('Granted end date'),
    render: GrantedCell,
    ellipsis: false,
  },
  {
    title: translate('Closed'),
    render: ({ row }) =>
      renderFieldOrDash(row.closed_at ? formatDate(row.closed_at) : null),
  },
];

interface Access {
  /** One of the proposal's managers: asks for and calls off the team's runs. */
  actsForApplicant: boolean;
  drivesCall: boolean;
  /** Changes asked of the team reopen what the extension asks for. */
  requestUnlocked: boolean;
}

/**
 * The changes the run's decision asked of the team: what to change, and a
 * button to hand them back once made.
 */
const RunChangesNotice: FC<{
  proposal: Proposal;
  actsForApplicant: boolean;
  refetch?(): void;
}> = ({ proposal, actsForApplicant, refetch }) => {
  const submit = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsSubmitChanges({ path: { uuid: proposal.uuid } }),
    confirmation: {
      title: translate('Submit changes'),
      body: translate(
        'Hand the changes back? They cannot be edited afterwards.',
      ),
    },
    successMessage: translate('The changes have been submitted.'),
    errorMessage: translate('Unable to submit the changes.'),
    refetch,
    invalidateQueries: [
      { queryKey: proposalRunsKey(proposal.uuid) },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
    ],
  });
  const requests = proposal.open_change_requests ?? [];
  if (
    !requests.length ||
    !(
      runPartUnlocked(proposal, 'run_form') ||
      runPartUnlocked(proposal, 'run_request')
    )
  ) {
    return null;
  }
  const unlocked = Array.from(
    new Set(requests.flatMap((request) => request.unlocked_parts)),
  );
  return (
    <AlertItem
      variant="warning"
      type="floating"
      title={translate('Changes requested')}
      body={
        <div className="flex flex-col gap-1">
          {requests.map((request) => (
            <span key={request.uuid}>{request.message}</span>
          ))}
          <span className="text-quaternary">
            {translate('Unlocked: {parts}', {
              parts: unlocked.map(changeRequestPartLabel).join(', '),
            })}
          </span>
        </div>
      }
      actions={
        actsForApplicant ? (
          <BaseButton
            label={translate('Submit changes')}
            onClick={() => submit.mutate()}
            pending={submit.isPending}
            variant="primary"
          />
        ) : undefined
      }
    />
  );
};

const RunActions: FC<{
  row: ProposalRun;
  proposal: Proposal;
  access: Access;
  refetch?(): void;
}> = ({ row, proposal, access, refetch }) => {
  const { openDialog } = useModal();
  const mode = runEditMode(row, access);
  const withdraw = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsWithdrawRun({
        path: { uuid: proposal.uuid },
        body: { run_uuid: row.uuid },
      }),
    confirmation: {
      title: translate('Withdraw'),
      body: translate('Call off this {run}? Nothing it asks for is granted.', {
        run: runPhaseLabel(row.phase).toLowerCase(),
      }),
    },
    successMessage: translate('The run has been withdrawn.'),
    errorMessage: translate('Unable to withdraw the run.'),
    refetch,
    invalidateQueries: [
      { queryKey: proposalRunsKey(proposal.uuid) },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
    ],
  });
  const withdrawable = canWithdrawRun(row, access);
  if (!mode && !withdrawable) return null;
  return (
    <ActionsDropdown row={row}>
      {mode && (
        <ActionItem
          title={
            mode === 'grant'
              ? translate('Edit what is granted')
              : translate('Edit the request')
          }
          iconNode={<PencilSimpleIcon weight="bold" />}
          action={() =>
            openDialog(ProposalRunDialog, {
              resolve: { proposal, run: row, mode, refetch },
              size: 'lg',
            })
          }
        />
      )}
      {withdrawable && (
        <ActionItem
          title={translate('Withdraw')}
          iconNode={<XCircleIcon weight="bold" />}
          className="text-danger"
          iconColor="danger"
          action={() => withdraw.mutate()}
          disabled={withdraw.isPending}
        />
      )}
    </ActionsDropdown>
  );
};

const RunsTable: FC<{
  proposal: Proposal;
  rows: ProposalRun[];
  version: number;
  access: Access;
  refetch?(): void;
}> = ({ proposal, rows, version, access, refetch }) => {
  const filter = useMemo(() => ({ version }), [version]);
  const tableProps = useTable({
    table: `ProposalRuns-${proposal.uuid}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
    filter,
  });
  const rowActions = useMemo(
    () =>
      ({ row }: { row: ProposalRun }) => (
        <RunActions
          row={row}
          proposal={proposal}
          access={access}
          refetch={refetch}
        />
      ),
    [proposal, access, refetch],
  );
  return (
    <Table
      {...tableProps}
      // A short list, shown whole.
      hasPagination={false}
      columns={columns}
      rowActions={rowActions}
      verboseName={translate('runs')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

/**
 * Who the viewer is to the proposal's post-award work, its runs, and
 * whether the page has a section for it: the runs are readable and there
 * is a run, an extension window, or the call to drive.
 */
export const usePostAward = (proposal: Proposal) => {
  const user = useUser();
  const accepted = proposal.state === 'accepted';
  const runs = useProposalRuns(proposal.uuid, accepted);
  const onTeam = isOnProposalTeam(user, proposal);
  const drivesCall =
    !onTeam &&
    Boolean(
      user?.is_staff ||
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
        scopeId: proposal.call_uuid,
        callOrganizerId: proposal.call_managing_organisation_uuid,
      }),
    );
  const requestUnlocked = runPartUnlocked(proposal, 'run_request');
  // The rest of the team reads the runs; only its managers act on them.
  const actsForApplicantNow = actsForApplicant(user, proposal);
  const access = useMemo(
    () => ({
      actsForApplicant: actsForApplicantNow,
      drivesCall,
      requestUnlocked,
    }),
    [actsForApplicantNow, drivesCall, requestUnlocked],
  );
  const shown =
    accepted &&
    !runs.isLoading &&
    runs.data !== null &&
    runs.data !== undefined &&
    (runs.data.length > 0 ||
      canRequestExtension(proposal, actsForApplicantNow) ||
      canOpenFinalReport(proposal, drivesCall));
  return { runs, access, shown };
};

/**
 * An accepted proposal's post-award work: its extension requests and its
 * final report. The team asks for an extension inside the call's window;
 * the call's managers open the final report early when the project has no
 * end date, or it opens by itself at the end of the allocation. The steps
 * of an open run are worked on as the evaluation's were, on this page.
 * Reviewers and panel members, whom the backend refuses, see nothing.
 */
export const PostAwardSection: FC<{
  proposal: Proposal;
  refetch?(): void;
}> = ({ proposal, refetch }) => {
  const openState = useSectionOpenState();
  const { openDialog } = useModal();
  const { runs, access, shown } = usePostAward(proposal);
  const { actsForApplicant: mayAct, drivesCall } = access;

  const openFinalReport = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsOpenFinalReport({ path: { uuid: proposal.uuid } }),
    confirmation: {
      title: translate('Open the final report'),
      body: translate(
        'Ask the team for the final report now, ahead of the end of the allocation?',
      ),
    },
    successMessage: translate('The final report has been opened.'),
    errorMessage: translate('Unable to open the final report.'),
    refetch,
    invalidateQueries: [
      { queryKey: proposalRunsKey(proposal.uuid) },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
    ],
  });

  const requestExtension = useCallback(
    () =>
      openDialog(ProposalRunDialog, {
        resolve: { proposal, mode: 'request', refetch },
        size: 'lg',
      }),
    [openDialog, proposal, refetch],
  );

  if (!shown) {
    return null;
  }
  const mayRequest = canRequestExtension(proposal, mayAct);
  const mayOpenReport = canOpenFinalReport(proposal, drivesCall);

  return (
    <AccordionCard
      id={POST_AWARD_SECTION_ID}
      title={translate('Extensions and final report')}
      subtitle={translate(
        'What follows the award: requests to extend the project, and its final report at the end of the allocation.',
      )}
      actions={
        <div className="flex gap-1.5">
          {mayRequest && (
            <BaseButton
              label={translate('Request extension')}
              iconNode={<ArrowClockwiseIcon weight="bold" />}
              onClick={requestExtension}
              variant="tertiary"
            />
          )}
          {mayOpenReport && (
            <BaseButton
              label={translate('Open final report')}
              iconNode={<FileTextIcon weight="bold" />}
              onClick={() => openFinalReport.mutate()}
              disabled={openFinalReport.isPending}
              tooltip={
                openFinalReport.isPending
                  ? translate('The final report is being opened.')
                  : undefined
              }
              variant="tertiary"
            />
          )}
        </div>
      }
      {...sectionOpenProps(openState, POST_AWARD_SECTION_ID, true)}
    >
      <RunChangesNotice
        proposal={proposal}
        actsForApplicant={mayAct}
        refetch={refetch}
      />
      <PropertyList variant="summary">
        <PropertyItem
          label={translate('Status')}
          value={
            proposal.post_award_status
              ? postAwardStatusLabel(proposal.post_award_status)
              : null
          }
          hideIfEmpty={false}
        />
        {!proposal.completed_at && (
          <PropertyItem
            label={translate('Extensions can be requested until')}
            value={propVal.date(proposal.extension_requestable_until)}
          />
        )}
        <PropertyItem
          label={translate('Completed')}
          value={propVal.date(proposal.completed_at)}
        />
      </PropertyList>
      <RunsTable
        proposal={proposal}
        rows={runs.data ?? []}
        version={runs.dataUpdatedAt}
        access={access}
        refetch={refetch}
      />
    </AccordionCard>
  );
};
