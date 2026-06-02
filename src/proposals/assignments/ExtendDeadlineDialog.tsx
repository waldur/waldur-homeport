import { FC, useCallback } from 'react';
import { Form, Field } from 'react-final-form';
import {
  assignmentBatchesExtendDeadline,
  AssignmentBatchList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { SubmitButton } from '@/form';
import { FormGroup } from '@/form';
import { DateTimeField } from '@/form/DateTimeField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ExtendDeadlineDialogProps {
  resolve: {
    batch: AssignmentBatchList;
    refetch: () => void;
  };
}

interface FormValues {
  expires_at: string | Date;
}

export const ExtendDeadlineDialog: FC<ExtendDeadlineDialogProps> = ({
  resolve,
}) => {
  const { batch, refetch } = resolve;

  const handleSubmitMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      assignmentBatchesExtendDeadline({
        path: { uuid: batch.uuid },
        body: {
          expires_at:
            values.expires_at instanceof Date
              ? values.expires_at.toISOString()
              : new Date(values.expires_at).toISOString(),
        },
      }),
    successMessage: translate('Deadline extended successfully.'),
    errorMessage: translate('Failed to extend deadline.'),
    refetch,
  });

  const validateExpiresAt = useCallback((value: Date) => {
    if (!value) {
      return translate('This field is required.');
    }
    if (new Date(value) <= new Date()) {
      return translate('New deadline must be in the future.');
    }
    return undefined;
  }, []);

  return (
    <Form<FormValues>
      onSubmit={(values) => handleSubmitMutation.mutateAsync(values)}
      initialValues={{
        expires_at: batch.expires_at ? new Date(batch.expires_at) : undefined,
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Extend deadline')}
            subtitle={translate(
              'Set a new expiration date for this assignment batch.',
            )}
            footer={
              <>
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Save')}
                />
                <CloseDialogButton />
              </>
            }
          >
            <div className="size-lg">
              {batch.expires_at && (
                <FormGroup label={translate('Current deadline')}>
                  <div className="form-control-plaintext">
                    {formatDateTime(batch.expires_at)}
                    {batch.is_expired && (
                      <Badge variant="danger" outline className="ms-2">
                        {translate('Expired')}
                      </Badge>
                    )}
                  </div>
                </FormGroup>
              )}

              <FormGroup label={translate('New deadline')} required>
                <Field
                  name="expires_at"
                  component={DateTimeField}
                  validate={validateExpiresAt}
                  minDate="today"
                  placeholder={translate('Select date and time...')}
                />
              </FormGroup>

              {batch.is_expired && (
                <div className="alert alert-info">
                  {translate(
                    'This batch has expired. Setting a new deadline will reactivate it and allow the reviewer to respond.',
                  )}
                </div>
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
