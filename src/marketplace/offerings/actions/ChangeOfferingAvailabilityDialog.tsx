import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsMakeAvailable,
  marketplaceProviderOfferingsMakeUnavailable,
  marketplaceProviderResourcesList,
  Offering,
  Resource,
} from 'waldur-js-client';

import { SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const mandatoryFields = [
  'uuid',
  'name',
  'customer_name',
  'project_name',
  'resource_type',
];

const OfferingResourcesTable = ({ offering }) => {
  const filter = useMemo(() => {
    return {
      offering_uuid: offering.uuid,
      state: NON_TERMINATED_STATES,
    };
  }, [offering]);

  const tableProps = useTable({
    table: 'OfferingResourcesReview-' + offering.uuid,
    fetchData: createFetcher(marketplaceProviderResourcesList),
    filter,
    mandatoryFields,
  });

  return (
    <Table<Resource>
      {...tableProps}
      title={translate('Resources')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
        },
        {
          title: translate('Organization'),
          render: ({ row }) => <>{row.customer_name}</>,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name}</>,
        },
        {
          title: translate('Type'),
          render: ({ row }) => <>{renderFieldOrDash(row.resource_type)}</>,
        },
      ]}
      verboseName={translate('Resources')}
      minHeight={265}
      fullWidth
      equalColWidth
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      hasActionBar={false}
      className="mb-5"
    />
  );
};

export const ChangeOfferingAvailabilityDialog: FunctionComponent<{
  resolve: { offering: Offering; refetch };
}> = ({ resolve: { offering, refetch } }) => {
  const availabilityMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      if (offering.state === 'Unavailable') {
        return marketplaceProviderOfferingsMakeAvailable({
          path: { uuid: offering.uuid },
        });
      } else {
        return marketplaceProviderOfferingsMakeUnavailable({
          path: { uuid: offering.uuid },
        });
      }
    },
    successMessage: translate('Offering state has been updated.'),
    errorMessage: translate('Unable to update offering state.'),
    refetch,
  });

  return (
    <Form
      onSubmit={() => availabilityMutation.mutateAsync(undefined)}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              offering.state === 'Unavailable'
                ? translate('Restore {offeringName} offering', {
                    offeringName: offering.name,
                  })
                : translate('Set {offeringName} offering as down', {
                    offeringName: offering.name,
                  })
            }
            subtitle={
              offering.state === 'Unavailable'
                ? translate(
                    'This will mark this {offeringName} offering as available again. All dependent offerings and their resources will become fully operational.',
                    { offeringName: offering.name },
                  )
                : translate(
                    'This will mark this {offeringName} offering as unavailable. All operations on its resources will be blocked until restored.',
                    { offeringName: offering.name },
                  )
            }
            bodyClassName="h-500px"
            footer={
              <>
                <CloseDialogButton className="w-175px" />
                <SubmitButton
                  submitting={submitting}
                  label={
                    offering.state === 'Unavailable'
                      ? translate('Confirm & restore')
                      : translate('Confirm')
                  }
                  className={classNames(
                    'btn btn-primary',
                    offering.state === 'Unavailable' ? 'mw-200px' : 'w-175px',
                  )}
                />
              </>
            }
          >
            {offering.state === 'Unavailable' ? (
              <p className="text-quaternary">
                {translate(
                  'The change affects all offering connected to this cluster:',
                )}
              </p>
            ) : (
              <p className="text-quaternary">
                {translate(
                  'You can review the list of affected resources before confirming.',
                )}
                <br />
                {translate('Impacted resources:')}
              </p>
            )}
            <OfferingResourcesTable offering={offering} />
            <FormGroup>
              <Field
                name="reason"
                component={TextField as any}
                as="textarea"
                placeholder={
                  offering.state === 'Unavailable'
                    ? translate('Optional reason (displayed in logs)')
                    : translate('Optional reason (displayed to users)')
                }
                rows={3}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
