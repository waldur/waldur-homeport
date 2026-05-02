import { CheckCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  marketplaceOrdersApproveByConsumer,
  marketplaceOrdersUpdateAttachment,
  type OrderDetails,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { OrderAttachmentField } from '@/marketplace/deploy/steps/OrderAttachmentField';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const UploadPurchaseOrderDialog = ({
  order,
  refetch,
  required,
}: {
  order: OrderDetails;
  refetch(): void | Promise<void>;
  required: boolean;
}) => {
  const approveMutation = useManagedMutation<any, any, any>({
    mutationFn: async (formData) => {
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
    },
    successMessage: translate('Order has been approved.'),
    errorMessage: translate('Unable to approve order.'),
    refetch,
  });
  return (
    <Form
      onSubmit={(values) => approveMutation.mutateAsync(values)}
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
