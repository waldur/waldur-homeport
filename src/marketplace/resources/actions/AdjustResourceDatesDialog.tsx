import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderResourcesAdjustDates,
  Resource,
} from 'waldur-js-client';

import { formatISODate, parseDate } from '@/core/dateUtils';
import { WarnCard } from '@/core/WarnCard';
import { SubmitButton, TextField } from '@/form';
import { DateField } from '@/form/DateField';
import { FormContainerFinal } from '@/form/FormContainerFinal';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormData {
  start_date: string;
  end_date: string;
  comment?: string;
}

interface AdjustResourceDatesDialogProps {
  resolve: {
    resource: Resource;
    refetch?(): void;
  };
}

export const AdjustResourceDatesDialog: FunctionComponent<
  AdjustResourceDatesDialogProps
> = ({ resolve: { resource, refetch } }) => {
  const mutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      marketplaceProviderResourcesAdjustDates({
        path: { uuid: resource.uuid },
        body: {
          start_date: formatISODate(formData.start_date),
          end_date: formatISODate(formData.end_date),
          comment: formData.comment ?? '',
        },
      }),
    invalidateQueries: [{ queryKey: ['marketplace-resources'] }],
    refetch,
    successMessage: translate('Resource dates have been adjusted.'),
    errorMessage: translate('Unable to adjust resource dates.'),
  });

  const today = DateTime.now().startOf('day').toISO();

  return (
    <Form<FormData>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => {})}
      initialValues={{
        start_date: resource.creation_order?.start_date ?? null,
        end_date: resource.end_date ?? null,
      }}
      validate={(values) => {
        const errors: Partial<Record<keyof FormData, string>> = {};
        if (!values.start_date) {
          errors.start_date = translate('Start date is required.');
        }
        if (!values.end_date) {
          errors.end_date = translate('End date is required.');
        }
        if (values.start_date && values.end_date) {
          if (parseDate(values.start_date) >= parseDate(values.end_date)) {
            errors.end_date = translate('End date must be after start date.');
          }
        }
        return errors;
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Adjust start and end dates')}
            subtitle={
              <>
                <b>{translate('Resource name')}</b>: {resource.name}
              </>
            }
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <WarnCard
              title={translate('No automatic billing changes')}
              description={translate(
                'Adjusting these dates does not regenerate invoices. Issue credits or refunds separately if needed.',
              )}
              className="mb-5"
            />
            <div className="row">
              <div className="col-sm-6">
                <FormContainerFinal submitting={submitting}>
                  <DateField
                    name="start_date"
                    label={translate('Start date')}
                    disabled={submitting}
                  />
                </FormContainerFinal>
              </div>
              <div className="col-sm-6">
                <FormContainerFinal submitting={submitting}>
                  <DateField
                    name="end_date"
                    label={translate('End date')}
                    disabled={submitting}
                    minDate={today}
                  />
                </FormContainerFinal>
              </div>
            </div>
            <FormContainerFinal submitting={submitting}>
              <TextField
                name="comment"
                label={translate('Comment')}
                rows={3}
                description={translate(
                  'Optional reason captured in the audit trail.',
                )}
              />
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
