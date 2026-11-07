import { ArrowUUpLeftIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useRef } from 'react';
import {
  ProposalReviewerSuggestion,
  proposalProposalsWithdrawReviewerSuggestion,
} from 'waldur-js-client';

import { AccordionCard, Badge } from 'waldur-ui';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { Proposal } from '../../types';
import { sectionOpenProps, useSectionOpenState } from '../sectionOpen';

import { suggestionStatusLabel, suggestionStatusVariant } from './constants';
import {
  isRefused,
  myReviewerSuggestionsKey,
  showsMyReviewerSuggestions,
  suggestedReviewersKey,
  useMyReviewerSuggestions,
} from './queries';

const SuggestReviewerDialog = lazyComponent(() =>
  import('./SuggestReviewerDialog').then((module) => ({
    default: module.SuggestReviewerDialog,
  })),
);

const WithdrawAction: FC<{
  row: ProposalReviewerSuggestion;
  proposal: Proposal;
  refetch(): void;
}> = ({ row, proposal, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsWithdrawReviewerSuggestion({
        path: { uuid: proposal.uuid },
        body: { suggestion_uuid: row.uuid },
      }),
    refetch,
    successMessage: translate('The suggestion has been taken back.'),
    errorMessage: translate('Unable to take the suggestion back.'),
  });
  return (
    <ActionItem
      title={translate('Take back')}
      action={() => mutate()}
      disabled={isPending}
      iconNode={<ArrowUUpLeftIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};

interface MyReviewerSuggestionsSectionProps {
  proposal: Proposal;
  /** Whether the viewer's step collecting suggestions is active. */
  canSuggest: boolean;
}

/**
 * The reviewers an evaluator (a rapporteur, say) suggested for the proposal,
 * and the form to suggest more while their step runs. The call manager turns
 * them into pool invitations; the applicant never sees them.
 */
export const MyReviewerSuggestionsSection: FC<
  MyReviewerSuggestionsSectionProps
> = ({ proposal, canSuggest }) => {
  const openState = useSectionOpenState();
  const queryClient = useQueryClient();
  const { data, error, isError, dataUpdatedAt } = useMyReviewerSuggestions(
    proposal.uuid,
    true,
  );
  const refetch = useCallback(() => {
    for (const queryKey of [
      myReviewerSuggestionsKey(proposal.uuid),
      suggestedReviewersKey(proposal.uuid),
    ]) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, proposal.uuid]);

  const rowsRef = useRef(data ?? []);
  rowsRef.current = data ?? [];
  const filter = useMemo(() => ({ version: dataUpdatedAt }), [dataUpdatedAt]);
  const fetchData = useCallback(
    () =>
      Promise.resolve({
        rows: rowsRef.current,
        resultCount: rowsRef.current.length,
      }),
    [],
  );
  const tableProps = useTable({
    table: `MyReviewerSuggestions-${proposal.uuid}`,
    fetchData,
    filter,
  });

  const title = translate('Suggested reviewers');
  if (isError) {
    return isRefused(error) ? null : (
      <AccordionCard
        id="step-my-reviewer-suggestions"
        title={title}
        {...sectionOpenProps(openState, 'step-my-reviewer-suggestions', true)}
      >
        <LoadingErred
          loadData={refetch}
          message={translate('Unable to load the reviewers you suggested.')}
        />
      </AccordionCard>
    );
  }
  if (!showsMyReviewerSuggestions({ data, isError, error }, canSuggest)) {
    return null;
  }

  const columns: Column<ProposalReviewerSuggestion>[] = [
    {
      title: translate('Reviewer'),
      render: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary">
            {row.suggested_user_name || row.suggested_email}
          </span>
          {row.suggested_user_name && row.suggested_email && (
            <span className="text-quaternary">{row.suggested_email}</span>
          )}
        </div>
      ),
    },
    {
      title: translate('Note'),
      render: ({ row }) => renderFieldOrDash(row.note),
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <Badge
          variant={suggestionStatusVariant(row.status)}
          size="sm"
          shape="pill"
          tone="outline"
        >
          {suggestionStatusLabel(row.status)}
        </Badge>
      ),
    },
  ];

  return (
    <AccordionCard
      id="step-my-reviewer-suggestions"
      title={title}
      subtitle={translate(
        'Reviewers you suggest for this proposal. The call manager may invite them to the reviewer pool; the applicant does not see them.',
      )}
      {...sectionOpenProps(openState, 'step-my-reviewer-suggestions', true)}
    >
      {canSuggest && (
        <div className="flex justify-end mb-3">
          <CreateModalButton
            dialog={SuggestReviewerDialog}
            resolve={{ proposal, refetch }}
            size="md"
            buttonSize="sm"
            title={translate('Suggest a reviewer')}
          />
        </div>
      )}
      <Table<ProposalReviewerSuggestion>
        {...tableProps}
        columns={columns}
        verboseName={translate('suggested reviewers')}
        hideTitle
        hasActionBar={false}
        hasPagination={false}
        placeholderHasRetry={false}
        rowActions={
          canSuggest
            ? ({ row }) =>
                row.status === 'pending' ? (
                  <ActionsDropdown
                    row={row}
                    refetch={refetch}
                    actions={[
                      ({ row }) => (
                        <WithdrawAction
                          row={row}
                          proposal={proposal}
                          refetch={refetch}
                        />
                      ),
                    ]}
                  />
                ) : null
            : undefined
        }
      />
    </AccordionCard>
  );
};
