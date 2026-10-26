import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplaceResourcesSetEndDate, Resource } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formatISODate } from '@/core/dateUtils';
import { BooleanGroup, DateGroup, FormFooter } from '@/form';
import { translate } from '@/i18n';
import {
  getTerminationDateProps,
  intersectTerminationDateBounds,
} from '@/marketplace/deploy/steps/TerminationDateField';
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

  // Resource lists request a field subset without creation_order, so a
  // delayed order start is not checked here; the API rejects such rows and
  // the batch mutation reports them.
  const sharedTerminationDateBounds = useMemo(
    () =>
      intersectTerminationDateBounds(
        props.resolve.rows.map((resource) =>
          getTerminationDateProps(resource.offering_plugin_options, {
            startDate: resource.creation_order?.start_date,
            projectEndDate: resource.project_end_date,
            createdDate: resource.created,
          }),
        ),
      ),
    [props.resolve.rows],
  );

  const noCommonDate = !sharedTerminationDateBounds.hasValidRange;

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
      render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set termination date')}
            subtitle={translate('{count} resources selected', { count })}
            footer={
              <FormFooter
                submitLabel={translate('Save')}
                submitDisabled={noCommonDate && !values.clear}
                submitDisabledReason={
                  noCommonDate && !values.clear
                    ? translate(
                        'The selected resources have no common termination date.',
                      )
                    : undefined
                }
              />
            }
          >
            <div>
              <BooleanGroup
                name="clear"
                label={translate('Clear termination date')}
                description={translate(
                  'Remove the termination date so the resource is not scheduled for expiration.',
                )}
              />
              {!values.clear && noCommonDate && (
                <AlertItem
                  type="floating"
                  variant="warning"
                  role="alert"
                  title={translate('No common termination date')}
                  body={translate(
                    'No single date is valid for all selected resources, for example because a project has ended or a resource starts after another project ends. Select fewer resources or clear the termination date.',
                  )}
                />
              )}
              {!values.clear && !noCommonDate && (
                <DateGroup
                  name="end_date"
                  label={translate('Termination date')}
                  description={translate(
                    'The date is inclusive. Once reached, resources will be scheduled for termination.',
                  )}
                  minDate={sharedTerminationDateBounds.minDate}
                  maxDate={sharedTerminationDateBounds.maxDate}
                />
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
