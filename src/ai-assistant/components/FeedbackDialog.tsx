import { FC } from 'react';
import { Form as FinalForm, Field, FormSpy } from 'react-final-form';
import type { FeedbackCategoryEnum } from 'waldur-js-client';

import { useMessageFeedbackMutation } from '@/ai-assistant/hooks/useMessageFeedbackMutation';
import { FEEDBACK_SELECT_OPTIONS } from '@/ai-assistant/lib/feedback/categories';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { SelectField } from '@/form/select/SelectField';
import { SubmitButton } from '@/form/SubmitButton';
import { TextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

const COMMENT_MAX = 2000;
const COUNTER_ID = 'feedback-comment-counter';

interface FormValues {
  comment: string;
  category: FeedbackCategoryEnum | null;
}

interface Resolve {
  messageUuid: string;
  score: boolean;
  currentComment?: string | null;
  currentCategory?: FeedbackCategoryEnum | null;
}

export const FeedbackDialog: FC<{ resolve: Resolve }> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { patchMessageByBackendUuid } = useThreadContext();
  const { submitAsync, isSubmitting } = useMessageFeedbackMutation(
    resolve.messageUuid,
  );

  const initialValues: FormValues = {
    comment: resolve.currentComment ?? '',
    category: resolve.currentCategory ?? null,
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const updated = await submitAsync({
        score: resolve.score,
        comment: values.comment || undefined,
        category: values.category || undefined,
      });
      if (updated) {
        patchMessageByBackendUuid(resolve.messageUuid, {
          feedback_score: updated.feedback_score,
          feedback_comment: updated.feedback_comment,
          feedback_category: updated.feedback_category,
          feedback_submitted_at: updated.feedback_submitted_at,
        });
      }
      closeDialog();
    } catch {
      // mutation's onError already shows a toast; keep dialog open.
    }
  };

  return (
    <FinalForm<FormValues> initialValues={initialValues} onSubmit={onSubmit}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              resolve.score
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
            {resolve.score === false && (
              <FormGroup
                label={translate('What type of issue was this? (optional)')}
              >
                <Field
                  name="category"
                  component={SelectField}
                  simpleValue
                  isClearable
                  placeholder={translate('Select a category')}
                  options={FEEDBACK_SELECT_OPTIONS}
                />
              </FormGroup>
            )}

            <FormGroup label={translate('Comment (optional)')} spaceless>
              <Field
                name="comment"
                component={TextField}
                placeholder={
                  resolve.score
                    ? translate('What was helpful about this response?')
                    : translate('What was wrong with this response?')
                }
                rows={4}
                maxLength={COMMENT_MAX}
                aria-describedby={COUNTER_ID}
              />
              <FormSpy subscription={{ values: true }}>
                {({ values: v }) => (
                  <div
                    id={COUNTER_ID}
                    className="text-muted small text-end mt-1"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {(v.comment ?? '').length} / {COMMENT_MAX}
                  </div>
                )}
              </FormSpy>
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </FinalForm>
  );
};
