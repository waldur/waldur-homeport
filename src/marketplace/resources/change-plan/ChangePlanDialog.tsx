import React from 'react';
import { Field, Form } from 'react-final-form';
import { useAsync } from 'react-use';
import { marketplaceResourcesSwitchPlan } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FormFooter } from '@/form';
import { ChoicesTable } from '@/form/ChoicesTable';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { usePermission } from '@/permissions/hooks';

import { FetchedData, loadData } from './utils';

interface ChangePlanDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
    refetch;
  };
}

const ChangePlanComponent = (props: FetchedData & { refetch? }) => {
  const hasPemission = usePermission();
  const orderCanBeApproved = hasPemission({
    permission: PermissionEnum.APPROVE_ORDER,
    customerId: props.resource.customer_uuid,
    projectId: props.resource.project_uuid,
  });

  const switchPlanMutation = useManagedMutation<any, any, any>({
    mutationFn: (data) =>
      marketplaceResourcesSwitchPlan({
        path: { uuid: props.resource.uuid },
        body: { plan: data.plan.url },
      }),
    successMessage: translate(
      'Resource plan change request has been submitted.',
    ),
    errorMessage: translate('Unable to submit plan change request.'),
    refetch: props.refetch,
  });

  return (
    <Form
      onSubmit={(values) =>
        switchPlanMutation.mutateAsync(values).catch(() => {
          /* error handled by useManagedMutation */
        })
      }
      initialValues={props.initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change resource plan')}
            footer={
              <FormFooter
                submitting={submitting}
                submitLabel={
                  orderCanBeApproved
                    ? translate('Submit')
                    : translate('Request for a change')
                }
              />
            }
          >
            {props.resource.plan_name ? (
              <p>
                <strong>{translate('Current plan')}</strong>:{' '}
                {props.resource.plan_name}
              </p>
            ) : (
              <p>{translate('Resource does not have any plan.')}</p>
            )}
            {props.choices.length > 1 ? (
              <div>
                <strong>{translate('New plan')}</strong>
                <Field
                  name="plan"
                  component={(fieldProps) => (
                    <ChoicesTable
                      columns={props.columns}
                      choices={props.choices.filter(
                        (plan) => plan.archived === false,
                      )}
                      input={fieldProps.input}
                    />
                  )}
                />
              </div>
            ) : (
              <p>{translate('There are no other plans available.')}</p>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};

export const ChangePlanDialog: React.FC<ChangePlanDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const asyncState = useAsync(
    () => loadData(resource.marketplace_resource_uuid),
    [resource.marketplace_resource_uuid],
  );
  return asyncState.value ? (
    <ChangePlanComponent
      resource={asyncState.value.resource}
      choices={asyncState.value.choices}
      columns={asyncState.value.columns}
      initialValues={asyncState.value.initialValues}
      refetch={refetch}
    />
  ) : asyncState.loading ? (
    <ModalDialog title={translate('Change resource plan')}>
      <LoadingSpinner />
    </ModalDialog>
  ) : asyncState.error ? (
    <ModalDialog title={translate('Change resource plan')}>
      <h3>{translate('Unable to load data.')}</h3>
    </ModalDialog>
  ) : null;
};
