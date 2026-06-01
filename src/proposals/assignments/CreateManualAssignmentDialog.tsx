import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  CallReviewerPool,
  callReviewerPoolsList,
  Proposal,
  proposalProposalsList,
  proposalProtectedCallsCreateManualAssignment,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectField, SubmitButton, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { Call } from '../types';

interface CreateManualAssignmentDialogProps {
  resolve: {
    call: Call;
    refetch: () => void;
    // When set, the proposals field is pre-populated and locked so the
    // dialog assigns a reviewer to just this proposal. Surfaced from the
    // proposal row / details "Create review" action.
    initialProposal?: Proposal;
  };
}

interface ReviewerOption {
  value: string;
  label: string;
  email: string;
  currentAssignments: number;
  maxAssignments: number;
}

interface ProposalOption {
  value: string;
  label: string;
}

interface FormValues {
  reviewer: ReviewerOption;
  proposals: ProposalOption[];
  manager_notes?: string;
}

export const CreateManualAssignmentDialog: FC<
  CreateManualAssignmentDialogProps
> = ({ resolve }) => {
  const { showSuccess } = useNotify();

  const { call, refetch, initialProposal } = resolve;

  // Fetch accepted reviewers from pool
  const { data: reviewers, isLoading: reviewersLoading } = useQuery({
    queryKey: ['callReviewerPools', call.uuid, 'accepted'],
    queryFn: async () => {
      const response = await callReviewerPoolsList({
        query: {
          call_uuid: call.uuid,
          invitation_status: ['accepted'],
          page_size: 200,
        },
      });
      return response.data;
    },
  });

  // Fetch proposals for this call (submitted or in_review status)
  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals', call.uuid, 'assignable'],
    queryFn: async () => {
      const response = await proposalProposalsList({
        query: {
          call_uuid: call.uuid,
          state: ['submitted', 'in_review'],
          page_size: 200,
        },
      });
      return response.data;
    },
  });

  const reviewerOptions: ReviewerOption[] = useMemo(
    () =>
      reviewers?.map((r: CallReviewerPool) => ({
        value: r.uuid,
        label: r.reviewer_name || r.reviewer_email || 'Unknown',
        email: r.reviewer_email,
        currentAssignments: r.current_assignments,
        maxAssignments: r.max_assignments,
      })) || [],
    [reviewers],
  );

  const proposalOptions: ProposalOption[] = useMemo(
    () =>
      proposals?.map((p: Proposal) => ({
        value: p.uuid,
        label: `${p.slug || p.uuid.slice(0, 8)}: ${p.name}`,
      })) || [],
    [proposals],
  );

  const initialValues = useMemo(
    () =>
      initialProposal
        ? {
            proposals: [
              {
                value: initialProposal.uuid,
                label: `${initialProposal.slug || initialProposal.uuid.slice(0, 8)}: ${initialProposal.name}`,
              },
            ],
          }
        : undefined,
    [initialProposal],
  );

  const createAssignmentMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      proposalProtectedCallsCreateManualAssignment({
        path: { uuid: call.uuid },
        body: {
          reviewer_pool_entry_uuid: values.reviewer.value,
          proposal_uuids: values.proposals.map((p) => p.value),
          manager_notes: values.manager_notes || '',
        },
      }),
    errorMessage: translate('Failed to create manual assignment.'),
    refetch,
    onSuccess: (response) => {
      const data = response.data;
      if (data.skipped_proposals && data.skipped_proposals.length > 0) {
        showSuccess(
          translate(
            'Created assignment batch with {count} items. {skipped} proposals were skipped.',
            {
              count: data.items_created,
              skipped: data.skipped_proposals.length,
            },
          ),
        );
      } else {
        showSuccess(
          translate('Created assignment batch with {count} items.', {
            count: data.items_created,
          }),
        );
      }
    },
  });

  const formatReviewerLabel = useCallback((option: ReviewerOption) => {
    return (
      <div>
        <div className="fw-bold">{option.label}</div>
        <small className="text-muted">
          {option.email} ({option.currentAssignments}/{option.maxAssignments}{' '}
          {translate('assigned')})
        </small>
      </div>
    );
  }, []);

  return (
    <Form<FormValues>
      onSubmit={(values) => createAssignmentMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Manual assignment')}
            subtitle={translate(
              'Manually assign proposals to a reviewer. A draft batch will be created which can then be sent.',
            )}
            footer={
              <>
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Create assignment')}
                />
                <CloseDialogButton />
              </>
            }
          >
            <div className="size-lg">
              <FormGroup label={translate('Reviewer')} required>
                <Field
                  name="reviewer"
                  component={SelectField}
                  options={reviewerOptions}
                  isLoading={reviewersLoading}
                  formatOptionLabel={formatReviewerLabel}
                  getOptionValue={(option: ReviewerOption) => option.value}
                  getOptionLabel={(option: ReviewerOption) => option.label}
                  placeholder={translate('Select reviewer...')}
                  validate={required}
                />
                {!reviewersLoading && reviewerOptions.length === 0 && (
                  <div className="form-text text-warning">
                    {translate(
                      'No accepted reviewers found. Invite reviewers to the pool first.',
                    )}
                  </div>
                )}
              </FormGroup>

              <FormGroup label={translate('Proposals')} required>
                <Field
                  name="proposals"
                  component={SelectField}
                  options={proposalOptions}
                  isMulti
                  isLoading={proposalsLoading}
                  placeholder={translate('Select proposals...')}
                  validate={required}
                  isDisabled={Boolean(initialProposal)}
                />
                {!proposalsLoading &&
                  !initialProposal &&
                  proposalOptions.length === 0 && (
                    <div className="form-text text-warning">
                      {translate(
                        'No assignable proposals found. Proposals must be in submitted or in_review state.',
                      )}
                    </div>
                  )}
              </FormGroup>

              <StringGroup
                name="manager_notes"
                placeholder={translate('e.g., Assigned due to expertise in...')}
                label={translate('Notes')}
                description={translate(
                  'Optional notes about this assignment (visible to managers only).',
                )}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
