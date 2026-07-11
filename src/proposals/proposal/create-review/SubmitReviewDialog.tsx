import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  proposalReviewsPartialUpdate,
  proposalReviewsSubmit,
} from 'waldur-js-client';

import { SubmitButton, TextGroup } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ProposalReview } from '@/proposals/types';
import { ActionButton } from '@/table/ActionButton';

import { RateStars } from './RateStars';

interface ReviewFormValues {
  summary_score?: number;
  summary_public_comment?: string;
  summary_private_comment?: string;
  coi_confirmed?: boolean;
}

interface SubmitReviewDialogProps {
  resolve: {
    review: ProposalReview;
    refetch?(): void;
  };
}

// Reviewers write and submit their review here instead of an inline page form:
// the proposal content stays visible on the page while the score/comments are
// entered in this focused modal.
export const SubmitReviewDialog: FC<SubmitReviewDialogProps> = ({
  resolve,
}) => {
  const { review, refetch } = resolve;

  // The call requires each reviewer to attest absence of conflict of interest
  // before their review can be submitted (a configured workflow-step flag).
  const coiRequired = Boolean(review.coi_confirmation_required);

  const initialValues: ReviewFormValues = {
    summary_score: review.summary_score,
    summary_public_comment: review.summary_public_comment,
    summary_private_comment: review.summary_private_comment,
    coi_confirmed: review.coi_confirmed,
  };

  // coi_confirmed is only writable via the submit action, not the draft PATCH.
  const draftBody = (values: ReviewFormValues) => ({
    summary_score: values.summary_score,
    summary_public_comment: values.summary_public_comment,
    summary_private_comment: values.summary_private_comment,
  });

  const saveDraft = useManagedMutation<any, any, ReviewFormValues>({
    mutationFn: (values) =>
      proposalReviewsPartialUpdate({
        path: { uuid: review.uuid },
        body: draftBody(values),
      }),
    successMessage: translate('Review saved as draft.'),
    errorMessage: translate('Unable to save review.'),
    refetch,
    // Keep the modal open so the reviewer can keep editing before submitting.
    closeModal: false,
  });

  const submitReview = useManagedMutation<any, any, ReviewFormValues>({
    mutationFn: async (values) => {
      // Persist the latest score/comments, then transition the review to
      // submitted (carrying the COI attestation) in a single user action.
      await proposalReviewsPartialUpdate({
        path: { uuid: review.uuid },
        body: draftBody(values),
      });
      return proposalReviewsSubmit({
        path: { uuid: review.uuid },
        body: { coi_confirmed: values.coi_confirmed },
      });
    },
    successMessage: translate('Proposal review submitted successfully.'),
    errorMessage: translate('Unable to submit review.'),
    refetch,
  });

  const pending = saveDraft.isPending || submitReview.isPending;

  return (
    <Form<ReviewFormValues>
      onSubmit={(values) => submitReview.mutate(values)}
      initialValues={initialValues}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Submit review')}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <ActionButton
                  variant="secondary"
                  title={translate('Save as draft')}
                  action={() => saveDraft.mutate(values)}
                  pending={saveDraft.isPending}
                  disabled={pending}
                  disabledReason={translate('Please wait...')}
                />
                <SubmitButton
                  submitting={submitReview.isPending}
                  disabled={pending || (coiRequired && !values.coi_confirmed)}
                  disabledReason={
                    coiRequired && !values.coi_confirmed
                      ? translate(
                          'Confirm absence of conflict of interest to submit.',
                        )
                      : undefined
                  }
                  label={translate('Submit review')}
                />
              </>
            }
          >
            <Field
              name="summary_score"
              component={(fieldProps) => {
                const starValue = Number(fieldProps.input.value) || 0;
                const ratingId = `rating-${fieldProps.input.name}`;
                return (
                  <div className="form-group mb-7">
                    <label className="form-label" htmlFor={ratingId}>
                      {translate('Rate')}
                    </label>
                    <div className="d-flex align-items-center gap-4">
                      <div id={ratingId}>
                        <RateStars
                          count={5}
                          size={20}
                          edit
                          isHalf={false}
                          value={starValue}
                          onChange={(value) => fieldProps.input.onChange(value)}
                        />
                      </div>
                      <span className="text-gray-700 mt-2">
                        {fieldProps.input.value === 1
                          ? translate('1 star')
                          : translate('{count} stars', {
                              count: fieldProps.input.value,
                            })}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <TextGroup
              name="summary_public_comment"
              maxLength={1000}
              label={translate('Comments')}
              placeholder={translate('Add your comment here')}
            />
            <TextGroup
              name="summary_private_comment"
              maxLength={1000}
              label={translate('Notes (not visible to user)')}
              placeholder={translate('Add your notes here')}
            />
            {coiRequired && (
              <div className="mt-4">
                <Field name="coi_confirmed" type="checkbox">
                  {(props) => (
                    <AwesomeCheckboxField
                      {...props}
                      label={translate(
                        'I confirm I have no conflict of interest with this proposal',
                      )}
                    />
                  )}
                </Field>
              </div>
            )}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
