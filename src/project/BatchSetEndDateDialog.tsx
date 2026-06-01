import { DateTime } from 'luxon';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { Project, projectsPartialUpdate } from 'waldur-js-client';

import { formatISODate } from '@/core/dateUtils';
import { FormFooter, DateGroup, BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useBatchMutation } from '@/modal/useBatchMutation';

interface FormData {
  end_date?: string;
  clear: boolean;
}

interface BatchSetEndDateDialogProps {
  resolve: {
    rows: Project[];
    refetch?(): void;
  };
}

export const BatchSetEndDateDialog: FC<BatchSetEndDateDialogProps> = (
  props,
) => {
  const count = props.resolve.rows.length;

  const updateMutation = useBatchMutation<Project, FormData>({
    rows: props.resolve.rows,
    mutationFn: (project, variables) =>
      projectsPartialUpdate({
        path: { uuid: project.uuid },
        body: {
          end_date:
            variables.clear || !variables.end_date
              ? null
              : formatISODate(variables.end_date),
        },
      }),
    successMessage: (variables) =>
      variables.clear
        ? translate('End date has been cleared for {count} projects.', {
            count,
          })
        : translate('End date has been updated for {count} projects.', {
            count,
          }),
    renderPartialSuccessMessage: (n) =>
      translate('End date updated for {n} of {count} projects.', {
        n,
        count,
      }),
    renderErrorMessage: (n) =>
      translate('Failed to update end date for {n} of {count} projects.', {
        n,
        count,
      }),
    refetch: props.resolve.refetch,
  });

  return (
    <Form<FormData>
      onSubmit={(formData) =>
        updateMutation.mutateAsync(formData).catch(() => {})
      }
      initialValues={{ clear: false }}
      render={({ handleSubmit, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set end date')}
            subtitle={translate('{count} projects selected', { count })}
            footer={<FormFooter submitLabel={translate('Save')} />}
          >
            <div className="size-sm">
              <BooleanGroup
                name="clear"
                label={translate('Clear end date')}
                help_text={translate(
                  'Remove the end date so projects are not scheduled for expiration.',
                )}
              />
              {!values.clear && (
                <DateGroup
                  name="end_date"
                  label={translate('End date')}
                  disabled={submitting}
                  description={translate(
                    'Project end date supersedes resource termination date if the resource termination date is after the project end date.',
                  )}
                  minDate={DateTime.now().plus({ days: 1 }).toISO()}
                />
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
