import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourcesUpdateLimits,
  ResourceUpdateLimitsRequest,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton, StringGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { checkOrderCanBeApproved } from '@/marketplace/orders/actions/selectors';
import { AttachmentRow } from '@/marketplace/resources/common/AttachmentRow';
import { getPurchaseOrderConfig } from '@/marketplace/resources/common/purchaseOrderConfig';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { ChangeLimitsComponent } from './ChangeLimitsComponent';
import { loadData } from './utils';

interface ChangeLimitsDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
    refetch;
  };
}

export const ChangeLimitsDialog: React.FC<ChangeLimitsDialogProps> = (
  props,
) => {
  const asyncState = useQuery({
    queryKey: [
      'ChangeLimitsDialog',
      props.resolve.resource.marketplace_resource_uuid,
    ],
    queryFn: () => loadData(props.resolve.resource.marketplace_resource_uuid),
  });

  const user = useUser();
  const customer = useCustomer();
  const project = useProject();

  const orderCanBeApproved = checkOrderCanBeApproved(user, customer, project);

  const changeLimitsMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const body: ResourceUpdateLimitsRequest = {
        limits: asyncState.data.limitSerializer(formData.limits),
      };
      if (formData.request_comment) {
        body.request_comment = formData.request_comment;
      }
      if (formData.attachment) {
        body.attachment = fileSerializer(formData.attachment);
      }
      const hasFile = formData.attachment instanceof File;
      return marketplaceResourcesUpdateLimits({
        path: { uuid: asyncState.data.resource.uuid },
        body,
        ...(hasFile ? formDataOptions : {}),
      });
    },
    successMessage: translate(
      'Resource limits change request has been submitted.',
    ),
    errorMessage: translate('Unable to submit limits change request.'),
    refetch: props.resolve.refetch ? () => props.resolve.refetch() : undefined,
  });

  return (
    <Form
      onSubmit={(values) => changeLimitsMutation.mutateAsync(values)}
      initialValues={asyncState.data ? asyncState.data.initialValues : {}}
      render={({
        handleSubmit,
        submitting,
        invalid,
        values,
        form: { change },
      }) => {
        const resource = asyncState.data?.resource;
        const { showPurchaseOrder } = getPurchaseOrderConfig(resource);

        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Change resource limits')}
              subtitle={
                <ScopeSubtitle
                  label={translate('Resource name')}
                  name={resource?.name}
                />
              }
              footer={
                <>
                  <CloseDialogButton />
                  {!asyncState.isLoading && (
                    <SubmitButton
                      submitting={submitting}
                      invalid={invalid}
                      label={
                        orderCanBeApproved
                          ? translate('Submit')
                          : translate('Request for a change')
                      }
                    />
                  )}
                </>
              }
            >
              {asyncState.isLoading ? (
                <LoadingSpinner />
              ) : asyncState.error ? (
                <h3>{translate('Unable to load data.')}</h3>
              ) : (
                <>
                  <ChangeLimitsComponent
                    data={asyncState.data}
                    orderCanBeApproved={orderCanBeApproved}
                  />
                  {showPurchaseOrder && (
                    <div className="mt-4">
                      <StringGroup
                        name="request_comment"
                        label={translate('Comment')}
                        description={translate(
                          'Optional note for the service provider, e.g. a PO number.',
                        )}
                        placeholder={translate('Optional')}
                        disabled={submitting}
                      />
                      <FormGroup
                        label={translate('Purchase order document')}
                        description={translate(
                          'Attach a PDF purchase order document.',
                        )}
                      >
                        <AttachmentRow
                          value={values.attachment || null}
                          onChange={(value) => change('attachment', value)}
                        />
                      </FormGroup>
                    </div>
                  )}
                </>
              )}
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
