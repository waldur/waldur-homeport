import { CheckCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  marketplaceOrdersApproveByConsumer,
  marketplaceOrdersUpdateAttachment,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@waldur/core/api';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { OrderAttachmentField } from '@waldur/marketplace/deploy/steps/OrderAttachmentField';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

export const UploadPurchaseOrderDialog = ({ order, refetch }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const callback = async (formData) => {
    try {
      await marketplaceOrdersUpdateAttachment({
        path: { uuid: order.uuid },
        body: {
          attachment: fileSerializer(formData.attachment),
        },
        ...formDataOptions,
      });

      await marketplaceOrdersApproveByConsumer({
        path: { uuid: order.uuid },
      });
      if (refetch) {
        await refetch();
      }
      closeDialog();
      showSuccess(translate('Order has been approved.'));
    } catch (error) {
      showErrorResponse(error, translate('Unable to approve order.'));
    }
  };
  return (
    <Form
      onSubmit={callback}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Approve order')}
            subtitle={translate(
              'Please upload Purchase Order document and click approve to continue.',
            )}
            iconNode={<CheckCircleIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Approve')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <OrderAttachmentField />
          </ModalDialog>
        </form>
      )}
    />
  );
};
