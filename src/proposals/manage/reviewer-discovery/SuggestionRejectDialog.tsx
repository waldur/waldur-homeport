import { FORM_ERROR } from 'final-form';
import { useCallback } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  reviewerSuggestionsReject,
  ReviewerSuggestion,
} from 'waldur-js-client';

import { SubmitButton, TextField } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface SuggestionRejectDialogProps {
  resolve: {
    suggestion: ReviewerSuggestion;
    refetch: () => void;
  };
}

interface FormValues {
  reason?: string;
}

export const SuggestionRejectDialog = ({
  resolve,
}: SuggestionRejectDialogProps) => {
  const dispatch = useDispatch();

  const processRequest = useCallback(
    async (values: FormValues) => {
      try {
        await reviewerSuggestionsReject({
          path: { uuid: resolve.suggestion.uuid },
          body: {
            reason: values.reason || '',
          },
        });
        resolve.refetch();
        dispatch(
          showSuccess(
            translate('Rejected suggestion for {name}.', {
              name: resolve.suggestion.reviewer_name,
            }),
          ),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to reject suggestion.')),
        );
        if (e.response && e.response.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return { [FORM_ERROR]: translate('Unable to reject suggestion.') };
      }
    },
    [resolve, dispatch],
  );

  return (
    <Form
      onSubmit={processRequest}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Reject suggestion')}
            closeButton
            footer={
              <>
                <SubmitButton
                  submitting={submitting}
                  label={translate('Reject')}
                  className="btn-danger"
                />
                <CloseDialogButton />
              </>
            }
          >
            <FormContainer submitting={submitting} className="size-lg">
              <p className="text-muted mb-4">
                {translate(
                  'Are you sure you want to reject {name} as a reviewer suggestion?',
                  { name: resolve.suggestion.reviewer_name },
                )}
              </p>
              <FormGroup label={translate('Rejection reason')}>
                <Field
                  name="reason"
                  component={TextField as any}
                  rows={3}
                  placeholder={translate(
                    'Optional reason for rejecting this suggestion...',
                  )}
                />
                <div className="form-text text-muted">
                  {translate(
                    'Providing a reason helps document the decision process.',
                  )}
                </div>
              </FormGroup>
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
