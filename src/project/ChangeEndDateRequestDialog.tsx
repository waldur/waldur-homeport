import { DateTime } from 'luxon';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { Project, projectEndDateChangeRequestsCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDate, formatISODate } from '@/core/dateUtils';
import { DateGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const projectUrl =
    project.url || `${ENV.apiEndpoint}api/projects/${project.uuid}/`;

  const createMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (data) =>
      projectEndDateChangeRequestsCreate({
        body: {
          project: projectUrl,
          requested_end_date: formatISODate(data.requested_end_date),
          ...(data.comment?.trim() && { comment: data.comment.trim() }),
        },
      }),
    successMessage: translate(
      'Project end date change request has been submitted.',
    ),
    errorMessage: translate(
      'Unable to submit project end date change request.',
    ),
    refetch,
    invalidateQueries: [{ queryKey: ['project-end-date-change-requests'] }],
  });

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
      onSubmit={(values) => createMutation.mutateAsync(values)}
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
            <DateGroup
              name="requested_end_date"
              label={translate('New end date')}
              minDate={minDate}
              placeholder="dd.mm.yyyy"
            />
            {project.end_date && (
              <p className="text-gray-700 mt-2">
                {translate('Old end date')}: {formatDate(project.end_date)}
              </p>
            )}
            <TextGroup
              label={translate('Reason for modifying')}
              name="comment"
              placeholder={translate('Provide a short explanation...')}
              rows={4}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
