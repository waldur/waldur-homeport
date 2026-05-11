import React from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import {
  marketplaceResourcesUpdateLimits,
  ResourceUpdateLimitsRequest,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FormContainerFinal, StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { orderCanBeApproved as getOrderCanBeApproved } from '@/marketplace/orders/actions/selectors';
import { AttachmentRow } from '@/marketplace/resources/common/AttachmentRow';
import { getPurchaseOrderConfig } from '@/marketplace/resources/common/purchaseOrderConfig';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const asyncState = useAsync(
    () => loadData(props.resolve.resource.marketplace_resource_uuid),
    [props.resolve.resource.marketplace_resource_uuid],
  );

  const orderCanBeApproved = useSelector(getOrderCanBeApproved);

  const changeLimitsMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const body: ResourceUpdateLimitsRequest = {
        limits: asyncState.value.limitSerializer(formData.limits),
      };
      if (formData.request_comment) {
        body.request_comment = formData.request_comment;
      }
      if (formData.attachment) {
        body.attachment = fileSerializer(formData.attachment);
      }
      const hasFile = formData.attachment instanceof File;
      return marketplaceResourcesUpdateLimits({
        path: { uuid: asyncState.value.resource.uuid },
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
      initialValues={asyncState.value ? asyncState.value.initialValues : {}}
      render={({
        handleSubmit,
        submitting,
        invalid,
        values,
        form: { change },
      }) => {
        const resource = asyncState.value?.resource;
        const { showPurchaseOrder } = getPurchaseOrderConfig(resource);

        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Change resource limits')}
              footer={
                <>
                  <CloseDialogButton />
                  {!asyncState.loading && (
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
              {asyncState.loading ? (
                <LoadingSpinner />
              ) : asyncState.error ? (
                <h3>{translate('Unable to load data.')}</h3>
              ) : (
                <>
                  <ChangeLimitsComponent
                    data={asyncState.value}
                    orderCanBeApproved={orderCanBeApproved}
                  />
                  {showPurchaseOrder && (
                    <FormContainerFinal
                      submitting={submitting}
                      className="mt-4"
                    >
                      <StringField
                        name="request_comment"
                        label={translate('Comment')}
                        description={translate(
                          'Optional note for the service provider, e.g. a PO number.',
                        )}
                        placeholder={translate('Optional')}
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
                    </FormContainerFinal>
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
