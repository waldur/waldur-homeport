import { CheckCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  marketplaceOrdersApproveByConsumer,
  marketplaceOrdersUpdateAttachment,
  OrderDetails,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { OrderAttachmentField } from '@/marketplace/deploy/steps/OrderAttachmentField';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

export const UploadPurchaseOrderDialog = ({
  order,
  refetch,
  required,
}: {
  order: OrderDetails;
  refetch(): void | Promise<void>;
  required: boolean;
}) => {
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
            <OrderAttachmentField required={required} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
