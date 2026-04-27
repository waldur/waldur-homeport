import { useDispatch } from 'react-redux';
import { Field, InjectedFormProps } from 'redux-form';
import { marketplaceResourcesUpdateLimits } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { AttachmentRow } from '@/marketplace/resources/common/AttachmentRow';
import { getPurchaseOrderConfig } from '@/marketplace/resources/common/purchaseOrderConfig';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { ChangeLimitsComponent } from './ChangeLimitsComponent';
import { connector, OwnProps, StateProps } from './connector';

interface DialogBodyProps extends OwnProps, InjectedFormProps, StateProps {
  submitRequest(data: any): void;
  orderCanBeApproved: boolean;
  initialValues: { limits: Limits };
}

export const DialogBody = connector((props: DialogBodyProps) => {
  const dispatch = useDispatch();

  const resource = props.asyncState.value?.resource;
  const { showPurchaseOrder } = getPurchaseOrderConfig(resource);

  const submitRequest = async (formData) => {
    try {
      const body: Record<string, unknown> = {
        limits: props.asyncState.value.limitSerializer(formData.limits),
      };
      if (formData.request_comment) {
        body.request_comment = formData.request_comment;
      }
      if (formData.attachment) {
        body.attachment = fileSerializer(formData.attachment);
      }
      const hasFile = formData.attachment instanceof File;
      await marketplaceResourcesUpdateLimits({
        path: { uuid: resource?.uuid },
        body: body as any,
        ...(hasFile ? formDataOptions : {}),
      });
      dispatch(
        showSuccess(
          translate('Resource limits change request has been submitted.'),
        ),
      );
      dispatch(closeModalDialog());
      if (props.refetch) {
        await props.refetch();
      }
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to submit limits change request.'),
        ),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Change resource limits')}
        footer={
          <>
            <CloseDialogButton />
            {!props.asyncState.loading && (
              <SubmitButton
                submitting={props.submitting}
                label={
                  props.orderCanBeApproved
                    ? translate('Submit')
                    : translate('Request for a change')
                }
              />
            )}
          </>
        }
      >
        {props.asyncState.loading ? (
          <LoadingSpinner />
        ) : props.asyncState.error ? (
          <h3>{translate('Unable to load data.')}</h3>
        ) : (
          <>
            <ChangeLimitsComponent
              plan={props.asyncState.value.plan}
              periods={props.periods}
              components={props.components}
              orderCanBeApproved={props.orderCanBeApproved}
              totalPeriods={props.totalPeriods}
              changedTotalPeriods={props.changedTotalPeriods}
              offeringLimits={props.asyncState.value.offeringLimits}
              shouldConcealPrices={props.shouldConcealPrices}
            />
            {showPurchaseOrder && (
              <>
                <FormGroup
                  label={translate('Comment')}
                  description={translate(
                    'Optional note for the service provider, e.g. a PO number.',
                  )}
                >
                  <div style={{ maxWidth: 300 }}>
                    <Field
                      name="request_comment"
                      component={StringField as any}
                      placeholder={translate('Optional')}
                    />
                  </div>
                </FormGroup>
                <FormGroup
                  label={translate('Purchase order document')}
                  description={translate(
                    'Attach a PDF purchase order document.',
                  )}
                  spaceless
                >
                  <Field
                    name="attachment"
                    component={({ input }) => (
                      <AttachmentRow
                        value={input.value || null}
                        onChange={input.onChange}
                      />
                    )}
                  />
                </FormGroup>
              </>
            )}
          </>
        )}
      </ModalDialog>
    </form>
  );
});
