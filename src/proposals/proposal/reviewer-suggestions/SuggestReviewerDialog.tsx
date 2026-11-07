import { UserCirclePlusIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProposalsMyReviewerSuggestionsCreate,
  proposalProposalsReviewerSuggestionCandidatesList,
  ReviewerSuggestionCandidate,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { email } from '@/core/validators';
import { AsyncSelectGroup, StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { Proposal } from '../../types';

import { suggestionStatusLabel, suggestionStatusVariant } from './constants';

interface SuggestReviewerValues {
  user?: ReviewerSuggestionCandidate | null;
  email?: string;
  note?: string;
}

/** The backend finds nobody for a shorter query. */
export const CANDIDATE_QUERY_MIN_LENGTH = 3;

export const candidateLabel = (candidate: ReviewerSuggestionCandidate) =>
  candidate.affiliation
    ? `${candidate.full_name} (${candidate.affiliation})`
    : candidate.full_name;

const CandidateOption = ({
  candidate,
}: {
  candidate: ReviewerSuggestionCandidate;
}) => (
  <div>
    <div>{candidate.full_name}</div>
    {candidate.affiliation ? (
      <small className="text-quaternary">{candidate.affiliation}</small>
    ) : null}
    {candidate.pool_status || candidate.has_conflict ? (
      <div className="flex flex-wrap gap-1 mt-1">
        {candidate.has_conflict ? (
          <Badge variant="danger" size="sm" shape="pill" tone="outline">
            {translate('Conflict of interest')}
          </Badge>
        ) : null}
        {candidate.pool_status ? (
          <Badge
            variant={suggestionStatusVariant(candidate.pool_status)}
            size="sm"
            shape="pill"
            tone="outline"
          >
            {translate('Reviewer pool: {status}', {
              status: suggestionStatusLabel(candidate.pool_status),
            })}
          </Badge>
        ) : null}
      </div>
    ) : null}
  </div>
);

/** Exactly one of a user and an address names the suggested reviewer. */
export const validateSuggestion = (values: SuggestReviewerValues) => {
  const hasUser = Boolean(values.user);
  const hasEmail = Boolean(values.email?.trim());
  if (hasUser === hasEmail) {
    return {
      email: translate('Pick a user or enter an e-mail address, not both.'),
    };
  }
  return {};
};

export const SuggestReviewerDialog = ({
  resolve,
}: {
  resolve: { proposal: Proposal; refetch(): void };
}) => {
  const { proposal, refetch } = resolve;
  const loadOptions = useCallback(
    async (search: string) => {
      const query = search.trim();
      if (query.length < CANDIDATE_QUERY_MIN_LENGTH) {
        return { options: [], hasMore: false };
      }
      const response = await proposalProposalsReviewerSuggestionCandidatesList({
        path: { uuid: proposal.uuid },
        query: { query },
      });
      return { options: response.data ?? [], hasMore: false };
    },
    [proposal.uuid],
  );

  const mutation = useManagedMutation<any, any, SuggestReviewerValues>({
    mutationFn: (values) =>
      proposalProposalsMyReviewerSuggestionsCreate({
        path: { uuid: proposal.uuid },
        body: {
          suggested_user: values.user?.uuid ?? null,
          suggested_email: values.user ? '' : values.email?.trim(),
          note: values.note ?? '',
        },
      }),
    successMessage: translate('The reviewer has been suggested.'),
    errorMessage: translate('Unable to suggest the reviewer.'),
    refetch,
  });

  return (
    <Form<SuggestReviewerValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      validate={validateSuggestion}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Suggest a reviewer')}
            subtitle={translate(
              'The call manager may invite the reviewers you suggest to the call’s reviewer pool. The applicant does not see your suggestions.',
            )}
            iconNode={<UserCirclePlusIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-[125px]" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Suggest')}
                  variant="primary"
                  className="min-w-[125px]"
                />
              </>
            }
          >
            <AsyncSelectGroup
              name="user"
              label={translate('User')}
              description={translate(
                'A registered reviewer: someone with a published reviewer profile or in the call’s reviewer pool, found by name, username or e-mail.',
              )}
              loadOptions={loadOptions}
              getOptionValue={(candidate: ReviewerSuggestionCandidate) =>
                candidate.uuid
              }
              getOptionLabel={candidateLabel}
              formatOptionLabel={(
                candidate: ReviewerSuggestionCandidate,
                { context },
              ) =>
                context === 'menu' ? (
                  <CandidateOption candidate={candidate} />
                ) : (
                  candidateLabel(candidate)
                )
              }
              isClearable={true}
              placeholder={translate('Search...')}
              noOptionsMessage={({ inputValue }) =>
                inputValue.trim().length >= CANDIDATE_QUERY_MIN_LENGTH
                  ? translate('No registered reviewer matches.')
                  : translate(
                      'Type at least {count} characters of a name, username or e-mail address.',
                      { count: CANDIDATE_QUERY_MIN_LENGTH },
                    )
              }
            />
            <StringGroup
              name="email"
              label={translate('Or an e-mail address')}
              description={translate(
                'For a reviewer you cannot find above, or without an account yet. The address of a registered user is matched to them.',
              )}
              validate={(value) => (value ? email(value) : undefined)}
            />
            <TextGroup
              name="note"
              label={translate('Note')}
              description={translate(
                'Why this reviewer: their expertise for the proposal.',
              )}
              maxLength={2000}
              spaceless
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
