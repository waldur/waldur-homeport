import { FC } from 'react';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import type { FeedbackCategoryEnum } from 'waldur-js-client';

import { FEEDBACK_SELECT_OPTIONS } from '@/ai-assistant/lib/feedback/categories';
import { required } from '@/core/validators';
import { SelectGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

const COUNTER_ID = 'feedback-comment-counter';

export interface FeedbackFormValues {
  comment: string;
  category: FeedbackCategoryEnum | null;
}

interface Props {
  score: boolean;
  initialValues: FeedbackFormValues;
  isSubmitting: boolean;
  onSubmit: (values: FeedbackFormValues) => void | Promise<void>;
  // The anonymous endpoint requires a category on a negative vote; the
  // authenticated one leaves it optional. Also drives the comment cap
  // (anon backend caps at 500, authenticated at 2000).
  requireCategory?: boolean;
  commentMax?: number;
}

// Shared feedback dialog body: title/subtitle, an (optional-or-required)
// category select on a negative vote, a comment field, and a live counter.
// Used by both the authenticated and anonymous feedback dialogs so the layout
// and copy live in exactly one place.
export const FeedbackForm: FC<Props> = ({
  score,
  initialValues,
  isSubmitting,
  onSubmit,
  requireCategory = false,
  commentMax = 2000,
}) => (
  <FinalForm<FeedbackFormValues>
    initialValues={initialValues}
    onSubmit={onSubmit}
  >
    {({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <ModalDialog
          title={
            score
              ? translate('Tell us what worked')
              : translate('What went wrong?')
          }
          subtitle={translate('Your feedback helps us improve.')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton
                submitting={isSubmitting}
                label={translate('Submit feedback')}
              />
            </>
          }
        >
          {score === false && (
            <SelectGroup
              name="category"
              simpleValue
              isClearable={!requireCategory}
              required={requireCategory}
              validate={requireCategory ? required : undefined}
              placeholder={translate('Select a category')}
              options={FEEDBACK_SELECT_OPTIONS}
              label={
                requireCategory
                  ? translate('What type of issue was this?')
                  : translate('What type of issue was this? (optional)')
              }
            />
          )}

          <TextGroup
            label={translate('Comment (optional)')}
            name="comment"
            placeholder={
              score
                ? translate('What was helpful about this response?')
                : translate('What was wrong with this response?')
            }
            rows={4}
            maxLength={commentMax}
            aria-describedby={COUNTER_ID}
            spaceless
          />
          <FormSpy subscription={{ values: true }}>
            {({ values: v }) => (
              <div
                id={COUNTER_ID}
                className="text-muted small text-end mt-1"
                aria-live="polite"
                aria-atomic="true"
              >
                {(v.comment ?? '').length} / {commentMax}
              </div>
            )}
          </FormSpy>
        </ModalDialog>
      </form>
    )}
  </FinalForm>
);
