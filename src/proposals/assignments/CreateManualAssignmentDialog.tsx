import { useQuery } from '@tanstack/react-query';
import { uniqueId } from 'lodash-es';
import { FC, useCallback, useMemo } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { components } from 'react-select';
import {
  CallReviewerPool,
  callReviewerPoolsList,
  Proposal,
  proposalProposalsList,
  proposalProtectedCallsCreateManualAssignment,
} from 'waldur-js-client';

import { Tag } from '@/core/Tag';
import { required } from '@/core/validators';
import { SubmitButton, StringGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { Call } from '../types';

const TruncatedMultiValue = (props: any) => (
  <Tag onClear={props.removeProps.onClick}>
    <span
      className="text-truncate d-inline-block align-bottom"
      style={{ maxWidth: 260 }}
    >
      {props.children}
    </span>
  </Tag>
);

const FirstChipValueContainer = (props: any) => {
  if (!props.hasValue) {
    return (
      <components.ValueContainer {...props}>
        {props.children}
      </components.ValueContainer>
    );
  }

  const [values, ...otherChildren] = props.children;
  const visibleValues = values.slice(0, 1);
  const hiddenValues = values.slice(1);

  return (
    <components.ValueContainer
      {...props}
      className="flex-nowrap overflow-hidden"
    >
      {visibleValues}
      {hiddenValues.length > 0 && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Popover
              className="metronic-select-tooltip"
              id={uniqueId('tip-proposals')}
            >
              <Popover.Body>
                {hiddenValues.map((child) => child.props?.children).join(', ')}
              </Popover.Body>
            </Popover>
          }
        >
          <Tag>
            +{hiddenValues.length} {translate('more')}
          </Tag>
        </OverlayTrigger>
      )}
      {otherChildren}
    </components.ValueContainer>
  );
};

const proposalsSelectComponents = {
  MultiValue: TruncatedMultiValue,
  ValueContainer: FirstChipValueContainer,
};

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

  const formatReviewerLabel = useCallback(
    (option: ReviewerOption, meta: { context: 'menu' | 'value' }) => {
      if (meta.context === 'value') {
        return <span className="text-truncate">{option.label}</span>;
      }
      return (
        <div>
          <div className="fw-bold">{option.label}</div>
          <small className="text-muted">
            {option.email} ({option.currentAssignments}/{option.maxAssignments}{' '}
            {translate('assigned')})
          </small>
        </div>
      );
    },
    [],
  );

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
              <SelectGroup
                label={translate('Reviewer')}
                required
                name="reviewer"
                options={reviewerOptions}
                isLoading={reviewersLoading}
                formatOptionLabel={formatReviewerLabel}
                getOptionValue={(option: ReviewerOption) => option.value}
                getOptionLabel={(option: ReviewerOption) => option.label}
                placeholder={translate('Select reviewer...')}
                validate={required}
                description={
                  !reviewersLoading && reviewerOptions.length === 0
                    ? translate(
                        'No accepted reviewers found. Invite reviewers to the pool first.',
                      )
                    : undefined
                }
              />

              <SelectGroup
                label={translate('Proposals')}
                required
                name="proposals"
                options={proposalOptions}
                isMulti
                isLoading={proposalsLoading}
                placeholder={translate('Select proposals...')}
                validate={required}
                isDisabled={Boolean(initialProposal)}
                components={proposalsSelectComponents}
                description={
                  !proposalsLoading &&
                  !initialProposal &&
                  proposalOptions.length === 0
                    ? translate(
                        'No assignable proposals found. Proposals must be in submitted or in_review state.',
                      )
                    : undefined
                }
              />

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
