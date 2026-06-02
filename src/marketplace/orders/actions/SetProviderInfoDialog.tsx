import { EnvelopeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOrdersSetProviderInfo,
  OrderDetails,
  OrderProviderInfoRequest,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { decodeFileName } from '@/core/utils';
import { SubmitButton, TextGroup, StringGroup } from '@/form';
import { FormGroup } from '@/form';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '../list/constants';

interface SetProviderInfoDialogProps {
  resolve: {
    order: OrderDetails;
    refetch?: () => void | Promise<void>;
  };
}

export const SetProviderInfoDialog: FC<SetProviderInfoDialogProps> = ({
  resolve,
}) => {
  const providerMutation = useManagedMutation<
    any,
    any,
    OrderProviderInfoRequest
  >({
    mutationFn: (formData) =>
      marketplaceOrdersSetProviderInfo({
        path: { uuid: resolve.order.uuid },
        body: {
          provider_message: formData.provider_message,
          provider_message_url: formData.provider_message_url || '',
          provider_message_attachment: fileSerializer(
            formData.provider_message_attachment?.[0],
          ),
        },
        ...formDataOptions,
      }),
    successMessage: translate('Provider info has been saved.'),
    errorMessage: translate('Unable to save provider info.'),
    refetch: resolve.refetch,
    invalidateQueries: [
      { queryKey: ['table', TABLE_MARKETPLACE_ORDERS] },
      { queryKey: ['table', TABLE_PUBLIC_ORDERS] },
      { queryKey: ['table', TABLE_PENDING_PUBLIC_ORDERS] },
      { queryKey: ['table', TABLE_PENDING_PROVIDER_PUBLIC_ORDERS] },
      { queryKey: ['OrderDetails', resolve.order.uuid] },
    ],
  });

  const initialValues = {
    provider_message: resolve.order.provider_message || '',
    provider_message_url: resolve.order.provider_message_url || '',
  };

  return (
    <Form
      onSubmit={(values) => providerMutation.mutate(values)}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Send info to customer')}
            iconNode={<EnvelopeIcon weight="bold" />}
            iconColor="info"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={providerMutation.isPending}
                  label={translate('Send')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <TextGroup
              name="provider_message"
              placeholder={translate('Enter a message for the customer...')}
              label={translate('Message')}
            />
            <StringGroup
              name="provider_message_url"
              placeholder="https://"
              label={translate('URL')}
            />
            <FormGroup label={translate('Attachment (PDF)')}>
              <Field name="provider_message_attachment">
                {({ input }) => (
                  <>
                    <UploadContainer
                      onDrop={(files) => input.onChange(files)}
                      message={translate('PDF (max. 10 MB)')}
                      accept={{ 'application/pdf': ['.pdf'] }}
                      multiple={false}
                      maxSize={10 * 1024 * 1024}
                    />
                    {input.value?.length > 0 ? (
                      <AttachmentItem
                        attachment={{
                          file: input.value[0],
                          file_name: input.value[0].name,
                          file_size: input.value[0].size,
                          mime_type: input.value[0].type,
                        }}
                        onDelete={() => input.onChange([])}
                      />
                    ) : (
                      !input.value &&
                      resolve.order.provider_message_attachment && (
                        <AttachmentItem
                          attachment={{
                            file: resolve.order.provider_message_attachment,
                            file_name: decodeFileName(
                              resolve.order.provider_message_attachment
                                .split('/')
                                .pop(),
                            ),
                            mime_type: 'application/pdf',
                          }}
                          onDelete={() => input.onChange(null)}
                        />
                      )
                    )}
                  </>
                )}
              </Field>
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
