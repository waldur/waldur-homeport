import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  proposalReviewsPartialUpdate,
  proposalReviewsSubmit,
} from 'waldur-js-client';

import { BaseButton, FormHeading } from 'waldur-ui';

import { SubmitButton, TextGroup } from '@/form';
import { SwitchField } from '@/form/SwitchField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CoiDeclaration } from '@/proposals/coi-declaration/CoiDeclaration';
import {
  criterionLabel,
  hasUnequalWeights,
  weightedOverall,
} from '@/proposals/review/criteriaScore';
import { ProposalReview } from '@/proposals/types';

import { RateStars } from './RateStars';

interface ReviewFormValues {
  summary_score?: number;
  /** Per-criterion scores, keyed by scoreKey(criterion uuid). */
  scores?: Record<string, number>;
  summary_public_comment?: string;
  summary_private_comment?: string;
  coi_confirmed?: boolean;
}

type Criterion = NonNullable<ProposalReview['criteria']>[number];

// A criterion's form key. Its UUID alone may look like a number, which
// final-form would read as an array index.
const scoreKey = (uuid: string) => `c${uuid}`;

const criteriaScores = (criteria: Criterion[], values: ReviewFormValues) =>
  Object.fromEntries(
    criteria.map((criterion) => [
      criterion.uuid,
      values.scores?.[scoreKey(criterion.uuid)] || null,
    ]),
  );

const unscoredCriteria = (criteria: Criterion[], values: ReviewFormValues) =>
  criteria.filter((criterion) => !values.scores?.[scoreKey(criterion.uuid)]);

// The summary score the backend derives: the criteria's weighted average,
// rounded half up. Null until a criterion is scored.
const overallScore = (criteria: Criterion[], values: ReviewFormValues) =>
  weightedOverall(
    criteria,
    (criterion) => values.scores?.[scoreKey(criterion.uuid)],
  );

const RatingField: FC<{ name: string; label: string; heading?: boolean }> = ({
  name,
  label,
  heading,
}) => (
  <Field<number> name={name}>
    {({ input }) => {
      const value = Number(input.value) || 0;
      const labelId = `rating-${name.replace(/\W/g, '-')}-label`;
      return (
        <div
          className={
            heading ? undefined : 'flex flex-wrap items-center gap-x-3 gap-y-1'
          }
        >
          {heading ? (
            <FormHeading id={labelId}>{label}</FormHeading>
          ) : (
            <span id={labelId} className="text-primary min-w-40 grow">
              {label}
            </span>
          )}
          <div className="flex items-center gap-3">
            <div role="group" aria-labelledby={labelId}>
              <RateStars
                count={5}
                size={20}
                edit
                isHalf={false}
                value={value}
                label={label}
                onChange={(next) => input.onChange(next)}
              />
            </div>
            <span className="text-secondary mt-1.5 min-w-14">
              {value === 1
                ? translate('1 star')
                : translate('{count} stars', { count: value })}
            </span>
          </div>
        </div>
      );
    }}
  </Field>
);

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

  // A step with criteria is rated per criterion, and the backend derives the
  // summary score from them; otherwise the review has a single rating.
  const criteria = useMemo(
    () => [...(review.criteria ?? [])].sort((a, b) => a.order - b.order),
    [review.criteria],
  );
  const hasCriteria = criteria.length > 0;

  const initialValues: ReviewFormValues = {
    summary_score: review.summary_score,
    summary_public_comment: review.summary_public_comment,
    summary_private_comment: review.summary_private_comment,
    coi_confirmed: review.coi_confirmed,
    scores: Object.fromEntries(
      criteria
        .filter((criterion) => review.criteria_scores?.[criterion.uuid])
        .map((criterion) => [
          scoreKey(criterion.uuid),
          review.criteria_scores[criterion.uuid],
        ]),
    ),
  };

  // coi_confirmed is only writable via the submit action, not the draft PATCH.
  const draftBody = (values: ReviewFormValues) => ({
    ...(hasCriteria
      ? { criteria_scores: criteriaScores(criteria, values) }
      : { summary_score: values.summary_score }),
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
      {({ handleSubmit, values }) => {
        const unscored = hasCriteria ? unscoredCriteria(criteria, values) : [];
        const coiMissing = coiRequired && !values.coi_confirmed;
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Submit review')}
              footer={
                <>
                  <CloseDialogButton variant="tertiary" />
                  <BaseButton
                    variant="secondary"
                    label={translate('Save as draft')}
                    onClick={() => saveDraft.mutate(values)}
                    pending={saveDraft.isPending}
                    disabled={pending}
                    disabledReason={translate('Please wait...')}
                    size="lg"
                  />
                  <SubmitButton
                    submitting={submitReview.isPending}
                    disabled={pending || coiMissing || unscored.length > 0}
                    disabledReason={
                      unscored.length > 0
                        ? translate(
                            'Rate every criterion to submit: {names}.',
                            {
                              names: unscored.map((c) => c.name).join(', '),
                            },
                          )
                        : coiMissing
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
              {hasCriteria ? (
                <div className="mb-5.5">
                  <FormHeading>{translate('Rate each criterion')}</FormHeading>
                  <div className="flex flex-col gap-2">
                    {criteria.map((criterion) => (
                      <RatingField
                        key={criterion.uuid}
                        name={`scores.${scoreKey(criterion.uuid)}`}
                        label={criterionLabel(criterion, criteria)}
                      />
                    ))}
                  </div>
                  <div className="text-secondary mt-2">
                    {overallScore(criteria, values)
                      ? translate('Overall score: {score} of 5', {
                          score: overallScore(criteria, values),
                        })
                      : hasUnequalWeights(criteria)
                        ? translate(
                            'The overall score is the weighted average of the criteria.',
                          )
                        : translate(
                            'The overall score is the average of the criteria.',
                          )}
                  </div>
                </div>
              ) : (
                <div className="mb-5.5">
                  <RatingField
                    name="summary_score"
                    label={translate('Rate')}
                    heading
                  />
                </div>
              )}
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
                <div className="mt-3">
                  <CoiDeclaration
                    text={review.coi_declaration_text}
                    fallback={null}
                  />
                  <Field name="coi_confirmed" type="checkbox">
                    {(props) => (
                      <SwitchField
                        {...props}
                        label={
                          review.coi_declaration_text
                            ? translate('I confirm the declaration above')
                            : translate(
                                'I confirm I have no conflict of interest with this proposal',
                              )
                        }
                      />
                    )}
                  </Field>
                </div>
              )}
            </ModalDialog>
          </form>
        );
      }}
    </Form>
  );
};
