import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  callReviewerPoolsList,
  proposalProposalsList,
  proposalProtectedCallsCreateManualAssignment,
  CallReviewerPool,
  Proposal,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectField, StringField, SubmitButton } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { Call } from '../types';

interface CreateManualAssignmentDialogProps {
  resolve: {
    call: Call;
    refetch: () => void;
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
  const dispatch = useDispatch();
  const { call, refetch } = resolve;

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

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const response = await proposalProtectedCallsCreateManualAssignment({
          path: { uuid: call.uuid },
          body: {
            reviewer_pool_entry_uuid: values.reviewer.value,
            proposal_uuids: values.proposals.map((p) => p.value),
            manager_notes: values.manager_notes || '',
          },
        });

        const data = response.data;
        if (data.skipped_proposals && data.skipped_proposals.length > 0) {
          dispatch(
            showSuccess(
              translate(
                'Created assignment batch with {count} items. {skipped} proposals were skipped.',
                {
                  count: data.items_created,
                  skipped: data.skipped_proposals.length,
                },
              ),
            ),
          );
        } else {
          dispatch(
            showSuccess(
              translate('Created assignment batch with {count} items.', {
                count: data.items_created,
              }),
            ),
          );
        }
        refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Failed to create manual assignment.'),
          ),
        );
      }
    },
    [call.uuid, refetch, dispatch],
  );

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
      onSubmit={handleSubmit}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Manual assignment')}
            subtitle={translate(
              'Manually assign proposals to a reviewer. A draft batch will be created which can then be sent.',
            )}
            closeButton
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
            <FormContainer submitting={submitting} className="size-lg">
              <FormGroup label={translate('Reviewer')} required>
                <Field
                  name="reviewer"
                  component={SelectField as any}
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
                  component={SelectField as any}
                  options={proposalOptions}
                  isMulti
                  isLoading={proposalsLoading}
                  placeholder={translate('Select proposals...')}
                  validate={required}
                />
                {!proposalsLoading && proposalOptions.length === 0 && (
                  <div className="form-text text-warning">
                    {translate(
                      'No assignable proposals found. Proposals must be in submitted or in_review state.',
                    )}
                  </div>
                )}
              </FormGroup>

              <FormGroup
                label={translate('Notes')}
                description={translate(
                  'Optional notes about this assignment (visible to managers only).',
                )}
              >
                <Field
                  name="manager_notes"
                  component={StringField as any}
                  placeholder={translate(
                    'e.g., Assigned due to expertise in...',
                  )}
                />
              </FormGroup>
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
