import { DateTime } from 'luxon';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { marketplaceResourcesSetEndDate, Resource } from 'waldur-js-client';

import { formatISODate } from '@/core/dateUtils';
import { FormFooter } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { DateField } from '@/form/DateField';
import { FormContainerFinal } from '@/form/FormContainerFinal';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useBatchMutation } from '@/modal/useBatchMutation';

interface FormData {
  end_date?: string;
  clear: boolean;
}

interface MultiSetEndDateDialogProps {
  resolve: {
    rows: Resource[];
    refetch?(): void;
  };
}

export const MultiSetEndDateDialog: FC<MultiSetEndDateDialogProps> = (
  props,
) => {
  const count = props.resolve.rows.length;

  const updateMutation = useBatchMutation<Resource, FormData>({
    rows: props.resolve.rows,
    mutationFn: (resource, variables) =>
      marketplaceResourcesSetEndDate({
        path: { uuid: resource.uuid },
        body: {
          end_date:
            variables.clear || !variables.end_date
              ? null
              : formatISODate(variables.end_date),
        },
      }),
    successMessage: (variables) =>
      variables.clear
        ? translate(
            'Termination date has been cleared for {count} resources.',
            {
              count,
            },
          )
        : translate(
            'Termination date has been updated for {count} resources.',
            {
              count,
            },
          ),
    renderPartialSuccessMessage: (n) =>
      translate('Termination date updated for {n} of {count} resources.', {
        n,
        count,
      }),
    renderErrorMessage: (n) =>
      translate(
        'Failed to update termination date for {n} of {count} resources.',
        { n, count },
      ),
    refetch: props.resolve.refetch,
  });

  return (
    <Form<FormData>
      onSubmit={(formData) =>
        updateMutation.mutateAsync(formData).catch(() => {})
      }
      initialValues={{ clear: false }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set termination date')}
            subtitle={translate('{count} resources selected', { count })}
            footer={
              <FormFooter
                submitting={submitting}
                invalid={invalid || (!values.clear && !values.end_date)}
                submitLabel={translate('Save')}
              />
            }
          >
            <FormContainerFinal submitting={submitting}>
              <Field
                name="clear"
                component={AwesomeCheckboxField as any}
                label={translate('Clear termination date')}
                help_text={translate(
                  'Remove the termination date so the resource is not scheduled for expiration.',
                )}
              />
              {!values.clear && (
                <DateField
                  name="end_date"
                  label={translate('Termination date')}
                  disabled={submitting}
                  description={translate(
                    'The date is inclusive. Once reached, resources will be scheduled for termination.',
                  )}
                  minDate={DateTime.now().plus({ weeks: 1 }).toISO()}
                />
              )}
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
