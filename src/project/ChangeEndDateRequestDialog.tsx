import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { projectEndDateChangeRequestsCreate, Project } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDate, formatISODate } from '@/core/dateUtils';
import { SubmitButton, TextField } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

interface ChangeEndDateRequestDialogProps {
  project: Project;
  refetch: () => void;
}

interface FormData {
  requested_end_date: string;
  comment?: string;
}

export const ChangeEndDateRequestDialog: FC<
  ChangeEndDateRequestDialogProps
> = ({ project, refetch }) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();

  const projectUrl =
    project.url || `${ENV.apiEndpoint}api/projects/${project.uuid}/`;

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      projectEndDateChangeRequestsCreate({
        body: {
          project: projectUrl,
          requested_end_date: formatISODate(data.requested_end_date),
          ...(data.comment?.trim() && { comment: data.comment.trim() }),
        },
      }),
    onSuccess: () => {
      showSuccess(
        translate('Project end date change request has been submitted.'),
      );
      dispatch(closeModalDialog());
      refetch();
      queryClient.invalidateQueries({
        queryKey: ['project-end-date-change-requests'],
      });
    },
    onError: (error) => {
      showErrorResponse(error);
    },
  });

  const onSubmit = (formData: FormData) => {
    createMutation.mutate(formData);
  };

  const validate = (values: FormData) => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!values.requested_end_date?.trim()) {
      errors.requested_end_date = translate('This field is required.');
    } else {
      const selectedDate = DateTime.fromISO(values.requested_end_date).startOf(
        'day',
      );
      const today = DateTime.now().startOf('day');
      if (selectedDate <= today) {
        errors.requested_end_date = translate(
          'Requested end date must be in the future.',
        );
      }
    }
    return errors;
  };

  const minDate = DateTime.now().plus({ days: 1 }).toISODate();

  return (
    <Form<FormData>
      onSubmit={onSubmit}
      validate={validate}
      initialValues={{ requested_end_date: '', comment: '' }}
      subscription={{ submitting: true, invalid: true }}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change end date')}
            subtitle={translate(
              "Submit a request to modify the project's end date.",
            )}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Confirm')}
                />
              </>
            }
          >
            <Field name="requested_end_date">
              {({ input, meta }) => (
                <FormGroup
                  controlId="requested_end_date"
                  label={translate('New end date')}
                  meta={meta}
                >
                  <DateField
                    input={input}
                    minDate={minDate}
                    placeholder="dd.mm.yyyy"
                  />
                </FormGroup>
              )}
            </Field>
            {project.end_date && (
              <p className="text-gray-700 mt-2">
                {translate('Old end date')}: {formatDate(project.end_date)}
              </p>
            )}
            <Field name="comment">
              {({ input, meta }) => (
                <FormGroup
                  label={translate('Reason for modifying')}
                  controlId="comment"
                  meta={meta}
                >
                  <TextField
                    input={input as any}
                    meta={meta as any}
                    placeholder={translate('Provide a short explanation...')}
                    rows={4}
                  />
                </FormGroup>
              )}
            </Field>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
