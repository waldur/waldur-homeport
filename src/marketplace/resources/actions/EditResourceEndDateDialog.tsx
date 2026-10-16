import { DateTime } from 'luxon';
import { FunctionComponent, useMemo } from 'react';
import { Form } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formatISODate, parseDate } from '@/core/dateUtils';
import { SubmitButton, DateGroup } from '@/form';
import { translate } from '@/i18n';
import {
  getTerminationDateProps,
  ResourceTerminationPluginOptions,
} from '@/marketplace/deploy/steps/TerminationDateField';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormData {
  end_date: string;
}

interface EditResourceEndDateDialogProps {
  resolve: {
    resource: Resource;
    pluginOptions?: ResourceTerminationPluginOptions;
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
        const terminationDateBounds = useMemo(
          () =>
            getTerminationDateProps(props.resolve.pluginOptions, {
              startDate: props.resolve.resource.creation_order?.start_date,
              projectEndDate: props.resolve.resource.project_end_date,
              createdDate: props.resolve.resource.created,
            }),
          [props.resolve.pluginOptions, props.resolve.resource],
        );
        const noValidDate = !terminationDateBounds.hasValidRange;

        const exceedsProjectEndDate = useMemo(() => {
          // When no date is valid at all, the alert below covers it and
          // "Use project date" would offer a date the API rejects.
          if (
            noValidDate ||
            !values.end_date ||
            !props.resolve.resource?.project_end_date
          )
            return false;
          return (
            parseDate(values.end_date) >
            parseDate(props.resolve.resource?.project_end_date)
          );
        }, [noValidDate, values.end_date, props.resolve.resource]);

        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Set termination date')}
              subtitle={
                <ScopeSubtitle
                  label={translate('Resource name')}
                  name={props.resolve.resource.name}
                />
              }
              footer={
                <>
                  <CloseDialogButton className="min-w-125px" />
                  <SubmitButton
                    submitting={submitting}
                    label={translate('Save')}
                    disabled={
                      invalid ||
                      exceedsProjectEndDate ||
                      (noValidDate && Boolean(values.end_date))
                    }
                    disabledReason={
                      noValidDate && values.end_date
                        ? translate(
                            'No termination date can be set. Clear the date to remove it.',
                          )
                        : undefined
                    }
                    variant="primary"
                    className="min-w-125px"
                  />
                </>
              }
            >
              <div className="size-sm">
                <DateGroup
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
                  minDate={terminationDateBounds.minDate}
                  maxDate={terminationDateBounds.maxDate}
                />

                {noValidDate && (
                  <AlertItem
                    type="floating"
                    variant="warning"
                    role="alert"
                    title={translate('No termination date available')}
                    body={translate(
                      'The project has ended or the offering no longer allows a termination date for this resource. The date can only be cleared.',
                    )}
                  />
                )}

                {exceedsProjectEndDate && (
                  <AlertItem
                    type="floating"
                    variant="warning"
                    role="alert"
                    title={translate('Date conflict')}
                    body={
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
                          className="text-anchor font-medium block mt-2"
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
              </div>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
