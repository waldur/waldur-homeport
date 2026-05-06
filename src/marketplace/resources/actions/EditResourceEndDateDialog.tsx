import { DateTime } from 'luxon';
import { FunctionComponent, useMemo } from 'react';
import { Form } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { formatISODate, parseDate } from '@/core/dateUtils';
import { WarnCard } from '@/core/WarnCard';
import { SubmitButton } from '@/form';
import { DateField } from '@/form/DateField';
import { FormContainerFinal } from '@/form/FormContainerFinal';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormData {
  end_date: string;
}

interface EditResourceEndDateDialogProps {
  resolve: {
    resource: Resource;
    refetch?(): void;
    updateEndDate?(uuid: string, date: string);
  };
}

export const EditResourceEndDateDialog: FunctionComponent<
  EditResourceEndDateDialogProps
> = (props) => {
  const updateMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      props.resolve.updateEndDate(
        props.resolve.resource.uuid,
        formData.end_date ? formatISODate(formData.end_date) : null,
      ),
    successMessage: translate(
      '{resourceName} resource has been updated successfully.',
      {
        resourceName: props.resolve.resource.name,
      },
    ),
    errorMessage: translate('Unable to edit resource.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form<FormData>
      onSubmit={(values) => updateMutation.mutateAsync(values).catch(() => {})}
      initialValues={{ end_date: props.resolve.resource.end_date }}
      render={({ handleSubmit, submitting, invalid, values, form }) => {
        const exceedsProjectEndDate = useMemo(() => {
          if (!values.end_date || !props.resolve.resource?.project_end_date)
            return false;
          return (
            parseDate(values.end_date) >
            parseDate(props.resolve.resource?.project_end_date)
          );
        }, [values.end_date, props.resolve.resource]);

        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Set termination date')}
              subtitle={
                <>
                  <b>{translate('Resource name')}</b>:{' '}
                  {props.resolve.resource.name}
                </>
              }
              footer={
                <>
                  <CloseDialogButton className="min-w-125px" />
                  <SubmitButton
                    submitting={submitting}
                    label={translate('Save')}
                    disabled={invalid || exceedsProjectEndDate}
                    className="btn btn-primary min-w-125px"
                  />
                </>
              }
            >
              <FormContainerFinal submitting={submitting}>
                <DateField
                  name="end_date"
                  label={translate('Termination date')}
                  hideLabel
                  spaceless
                  disabled={submitting}
                  description={
                    exceedsProjectEndDate
                      ? translate(
                          'Termination date is after end date. Resource will end with the project.',
                        )
                      : translate(
                          'The date is inclusive. Once reached, resource will be scheduled for termination.',
                        )
                  }
                  minDate={DateTime.now().plus({ weeks: 1 }).toISO()}
                  maxDate={
                    props.resolve.resource?.project_end_date
                      ? parseDate(
                          props.resolve.resource.project_end_date,
                        ).toISO()
                      : undefined
                  }
                />

                {exceedsProjectEndDate && (
                  <WarnCard
                    title={translate('Date conflict')}
                    description={
                      <>
                        {translate(
                          'The selected termination date ({terminationDate}) is after the project end date ({endDate}). The resource will be terminated on the project end date regardless of this setting.',
                          {
                            terminationDate: parseDate(
                              values.end_date,
                            ).toLocaleString(DateTime.DATE_MED),
                            endDate: parseDate(
                              props.resolve.resource.project_end_date,
                            ).toLocaleString(DateTime.DATE_MED),
                          },
                        )}
                        <button
                          className="text-anchor fw-bold d-block mt-2"
                          type="button"
                          onClick={() => {
                            form.change(
                              'end_date',
                              props.resolve.resource?.project_end_date,
                            );
                          }}
                        >
                          {translate('Use project date')}
                        </button>
                      </>
                    }
                    className="mt-5"
                  />
                )}
              </FormContainerFinal>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
