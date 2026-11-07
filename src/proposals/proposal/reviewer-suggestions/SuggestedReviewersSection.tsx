import {
  EnvelopeSimpleIcon,
  TrashIcon,
  UserSwitchIcon,
} from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useRef } from 'react';
import {
  proposalProposalsDiscardSuggestedReviewers,
  proposalProposalsInviteSuggestedReviewers,
  SuggestedReviewer,
} from 'waldur-js-client';

import { AccordionCard, Badge, BaseButton } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  ASSIGNMENT_BATCHES_STATE,
  assignmentBatchesParams,
} from '@/proposals/update/reviewer-pool/tabs';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { Proposal } from '../../types';
import { sectionOpenProps, useSectionOpenState } from '../sectionOpen';

import {
  assignmentBatchStatusLabel,
  invitationSummary,
  suggestionStatusLabel,
  suggestionStatusVariant,
} from './constants';
import {
  showsSuggestedReviewers,
  suggestedReviewersKey,
  useSuggestedReviewers,
} from './queries';

/** Suggested people who may still be invited; an expired invitation is
 * sent again. */
const isInvitable = (row: SuggestedReviewer) =>
  ['pending', 'discarded', 'expired'].includes(row.status) &&
  !row.is_on_applicant_team;

const useInvite = (proposal: Proposal, refetch: () => void) => {
  const { showSuccess, showRedirectMessage, showError } = useNotify();
  return useManagedMutation<any, any, SuggestedReviewer[]>({
    mutationFn: (rows) =>
      proposalProposalsInviteSuggestedReviewers({
        path: { uuid: proposal.uuid },
        body: { suggestion_uuids: rows.map((row) => row.suggestion_uuids[0]) },
      }),
    refetch,
    onSuccess: (response) => {
      if (!response?.data) {
        return;
      }
      const { level, message } = invitationSummary(response.data);
      if (level === 'success') {
        showSuccess(message);
      } else if (level === 'warning') {
        showRedirectMessage(
          translate('Not every suggested reviewer was invited.'),
          message,
        );
      } else {
        showError(message);
      }
    },
    errorMessage: translate('Unable to invite the suggested reviewers.'),
  });
};

interface RowActionProps {
  row: SuggestedReviewer;
  proposal: Proposal;
  refetch(): void;
}

const InviteAction: FC<RowActionProps> = ({ row, proposal, refetch }) => {
  const { mutate, isPending } = useInvite(proposal, refetch);
  return (
    <ActionItem
      title={translate('Invite to pool')}
      action={() => mutate([row])}
      disabled={isPending}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
    />
  );
};

const DiscardAction: FC<RowActionProps> = ({ row, proposal, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsDiscardSuggestedReviewers({
        path: { uuid: proposal.uuid },
        body: { suggestion_uuids: row.suggestion_uuids },
      }),
    refetch,
    successMessage: translate('The suggestion has been discarded.'),
    errorMessage: translate('Unable to discard the suggestion.'),
  });
  return (
    <ActionItem
      title={translate('Discard')}
      action={() => mutate()}
      disabled={isPending}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};

const CreateManualAssignmentDialog = lazyComponent(() =>
  import('@/proposals/assignments/CreateManualAssignmentDialog').then(
    (module) => ({ default: module.CreateManualAssignmentDialog }),
  ),
);

/** Assigns the accepted reviewer to review this proposal, through the
 * call's own manual assignment: the review it brings contributes to the
 * proposal's review step. */
const AssignAction: FC<RowActionProps> = ({ row, proposal, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Assign to review')}
      action={() =>
        openDialog(CreateManualAssignmentDialog, {
          resolve: {
            call: { uuid: proposal.call_uuid },
            refetch,
            initialProposal: proposal,
            initialPoolEntryUuid: row.pool_entry_uuid,
          },
          size: 'lg',
        })
      }
      iconNode={<UserSwitchIcon weight="bold" />}
    />
  );
};

const flagsCell = (row: SuggestedReviewer) => {
  const flags = [];
  if (row.has_conflict) {
    flags.push(
      <Badge key="coi" variant="danger" size="sm" shape="pill" tone="outline">
        {translate('Conflict of interest')}
      </Badge>,
    );
  } else if (row.conflicts.length) {
    flags.push(
      <Badge key="coi" variant="warning" size="sm" shape="pill" tone="outline">
        {translate('Conflict of interest waived')}
      </Badge>,
    );
  }
  if (row.is_applicant_excluded) {
    flags.push(
      <Badge key="ex" variant="danger" size="sm" shape="pill" tone="outline">
        {translate('Excluded by the applicant')}
      </Badge>,
    );
  }
  if (row.is_on_applicant_team) {
    flags.push(
      <Badge key="team" variant="danger" size="sm" shape="pill" tone="outline">
        {translate('On the applicant team')}
      </Badge>,
    );
  }
  if (row.holds_evaluator_role) {
    flags.push(
      <Badge key="ev" variant="neutral" size="sm" shape="pill" tone="outline">
        {translate('Evaluator of this proposal')}
      </Badge>,
    );
  }
  if (row.already_in_pool && row.status === 'pending') {
    flags.push(
      <Badge key="pool" variant="info" size="sm" shape="pill" tone="outline">
        {translate('Already in the pool')}
      </Badge>,
    );
  }
  return flags.length ? (
    <div className="flex flex-wrap gap-1">{flags}</div>
  ) : (
    <span className="text-quaternary">{translate('None known')}</span>
  );
};

const BulkInviteButton: FC<{
  rows: SuggestedReviewer[];
  proposal: Proposal;
  refetch(): void;
}> = ({ rows, proposal, refetch }) => {
  const { mutate, isPending } = useInvite(proposal, refetch);
  const invitable = rows.filter(isInvitable);
  return (
    <BaseButton
      variant="primary"
      size="sm"
      label={translate('Invite {count} to pool', { count: invitable.length })}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
      disabled={isPending || !invitable.length}
      tooltip={
        invitable.length
          ? undefined
          : rows.some((row) => row.status === 'declined')
            ? translate(
                'A reviewer who declined the invitation is not invited again.',
              )
            : translate('None of the selected reviewers can be invited.')
      }
      onClick={() => mutate(invitable)}
    />
  );
};

interface SuggestedReviewersSectionProps {
  proposal: Proposal;
  /** Whether the viewer invites suggested reviewers, or only reads them. */
  canInvite: boolean;
}

/**
 * The reviewers the proposal's evaluators suggested, merged per person, with
 * who suggested them and why, the conflicts of interest known for them and
 * where their pool invitation stands. The call manager invites them to the
 * call's reviewer pool and, once they accept, assigns them to review this
 * proposal.
 */
export const SuggestedReviewersSection: FC<SuggestedReviewersSectionProps> = ({
  proposal,
  canInvite,
}) => {
  const openState = useSectionOpenState();
  const queryClient = useQueryClient();
  const { data, error, isError, dataUpdatedAt } = useSuggestedReviewers(
    proposal.uuid,
    true,
  );
  const refetch = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: suggestedReviewersKey(proposal.uuid),
      }),
    [queryClient, proposal.uuid],
  );

  const rowsRef = useRef(data ?? []);
  rowsRef.current = data ?? [];
  const filter = useMemo(() => ({ version: dataUpdatedAt }), [dataUpdatedAt]);
  const fetchData = useCallback(
    () =>
      Promise.resolve({
        // The table keeps rows and their selection by uuid; a suggested
        // person is identified by their key.
        rows: rowsRef.current.map((row) => ({ ...row, uuid: row.key })),
        resultCount: rowsRef.current.length,
      }),
    [],
  );
  const tableProps = useTable({
    table: `SuggestedReviewers-${proposal.uuid}`,
    fetchData,
    filter,
  });

  const { resetSelection } = tableProps;
  const afterBulkInvite = useCallback(() => {
    resetSelection();
    refetch();
  }, [resetSelection, refetch]);
  const BulkActions = useCallback(
    ({ rows }: { rows: SuggestedReviewer[] }) => (
      <BulkInviteButton
        rows={rows}
        proposal={proposal}
        refetch={afterBulkInvite}
      />
    ),
    [proposal, afterBulkInvite],
  );

  const title = translate('Reviewers suggested by the evaluators');
  // Refused: the viewer is not among its readers, and the section is not
  // theirs. Anything else is a failure to report.
  if (!showsSuggestedReviewers({ data, isError, error })) {
    return null;
  }
  if (isError) {
    return (
      <AccordionCard
        id="step-suggested-reviewers"
        title={title}
        {...sectionOpenProps(openState, 'step-suggested-reviewers', true)}
      >
        <LoadingErred
          loadData={refetch}
          message={translate('Unable to load the suggested reviewers.')}
        />
      </AccordionCard>
    );
  }

  const columns: Column<SuggestedReviewer>[] = [
    {
      title: translate('Reviewer'),
      render: ({ row }) => (
        <div className="flex flex-col">
          {/* The step's completer is not shown a picked user's address. */}
          <span className="font-medium text-primary">
            {row.suggested_user_name || row.email || translate('Unknown')}
          </span>
          {row.suggested_user_name && row.email && (
            <span className="text-quaternary">{row.email}</span>
          )}
        </div>
      ),
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <Badge
            variant={suggestionStatusVariant(row.status)}
            size="sm"
            shape="pill"
            tone="outline"
          >
            {suggestionStatusLabel(row.status)}
          </Badge>
          {row.status === 'invited' && row.invitation_expires_at && (
            <span className="text-quaternary">
              {translate('Expires {date}', {
                date: formatDate(row.invitation_expires_at),
              })}
            </span>
          )}
          {row.status === 'declined' && (
            <span className="text-quaternary">
              {translate('Declined the invitation; not invited again.')}
            </span>
          )}
          {row.assignment_batch_status === 'draft' && (
            <span className="text-quaternary" data-testid="draft-assignment">
              {translate('Added to a draft assignment batch — send it from')}{' '}
              <Link
                state={ASSIGNMENT_BATCHES_STATE}
                params={assignmentBatchesParams(proposal.call_uuid)}
                label={translate('Assignment batches')}
              />
            </span>
          )}
          {row.assignment_batch_status &&
            row.assignment_batch_status !== 'draft' && (
              <span className="text-quaternary">
                {translate('Assignment: {status}', {
                  status: assignmentBatchStatusLabel(
                    row.assignment_batch_status,
                  ),
                })}
              </span>
            )}
        </div>
      ),
    },
    {
      title: translate('Suggested by'),
      render: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.suggestions.map((suggestion) => (
            <div key={suggestion.uuid}>
              <span className="font-semibold">
                {suggestion.suggester_name ?? translate('Unknown')}
              </span>
              {suggestion.note && (
                <span className="text-quaternary">: {suggestion.note}</span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: translate('Flags'),
      render: ({ row }) => flagsCell(row),
    },
  ];

  return (
    <AccordionCard
      id="step-suggested-reviewers"
      title={title}
      subtitle={
        canInvite
          ? translate(
              'Merged per person. Invite them to the call’s reviewer pool; once they accept, assign them to review this proposal. The applicant does not see them.',
            )
          : translate(
              'Whom the evaluators suggested, and why. The same person may be listed once by account and once by an address typed for them. The applicant does not see them.',
            )
      }
      {...sectionOpenProps(openState, 'step-suggested-reviewers', true)}
    >
      <Table<SuggestedReviewer>
        {...tableProps}
        columns={columns}
        verboseName={translate('suggested reviewers')}
        hideTitle
        hasPagination={false}
        placeholderHasRetry={false}
        enableMultiSelect={canInvite}
        multiSelectActions={canInvite ? BulkActions : undefined}
        rowActions={
          canInvite
            ? ({ row }) => {
                const actions = [];
                if (isInvitable(row)) {
                  actions.push(InviteAction);
                }
                if (row.status === 'pending') {
                  actions.push(DiscardAction);
                }
                if (row.status === 'accepted' && row.pool_entry_uuid) {
                  actions.push(AssignAction);
                }
                return actions.length ? (
                  <ActionsDropdown
                    row={row}
                    refetch={refetch}
                    actions={actions.map((Action) => ({ row }) => (
                      <Action row={row} proposal={proposal} refetch={refetch} />
                    ))}
                  />
                ) : null;
              }
            : undefined
        }
      />
    </AccordionCard>
  );
};
