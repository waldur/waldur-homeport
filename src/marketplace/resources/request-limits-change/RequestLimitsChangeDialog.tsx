import React from 'react';
import { Form } from 'react-final-form';
import { useAsync } from 'react-use';
import { marketplaceResourceLimitChangeRequestsCreate } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ChangeLimitsComponent } from '@/marketplace/resources/change-limits/ChangeLimitsComponent';
import { loadData } from '@/marketplace/resources/change-limits/utils';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface RequestLimitsChangeDialogProps {
  resolve: {
    resource: { marketplace_resource_uuid: string };
    refetch?: () => void;
  };
}

export const RequestLimitsChangeDialog: React.FC<
  RequestLimitsChangeDialogProps
> = (props) => {
  const asyncState = useAsync(
    () => loadData(props.resolve.resource.marketplace_resource_uuid),
    [props.resolve.resource.marketplace_resource_uuid],
  );

  const mutation = useManagedMutation({
    mutationFn: (formData: any) => {
      const serializedLimits = asyncState.value!.limitSerializer(
        formData.limits,
      );
      return marketplaceResourceLimitChangeRequestsCreate({
        body: {
          resource: asyncState.value!.resource.uuid ?? '',
          requested_limits: serializedLimits,
        },
      });
    },
    successMessage: translate('Limit change request has been submitted.'),
    errorMessage: translate('Unable to submit limit change request.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={asyncState.value ? asyncState.value.initialValues : {}}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Request limit change')}
            footer={
              <>
                <CloseDialogButton label={translate('Cancel')} />
                {!asyncState.loading && (
                  <SubmitButton
                    submitting={submitting}
                    invalid={invalid}
                    label={translate('Send for Approval')}
                  />
                )}
              </>
            }
          >
            {asyncState.loading ? (
              <LoadingSpinner />
            ) : asyncState.error ? (
              <h3>{translate('Unable to load data.')}</h3>
            ) : asyncState.value ? (
              <ChangeLimitsComponent
                data={asyncState.value}
                orderCanBeApproved={false}
              />
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
