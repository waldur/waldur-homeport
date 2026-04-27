import { EnvelopeIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOrdersSetProviderInfo,
  OrderDetails,
  OrderProviderInfoRequest,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { decodeFileName } from '@/core/utils';
import { SubmitButton, TextField } from '@/form';
import { StringField } from '@/form/StringField';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

interface SetProviderInfoDialogProps {
  resolve: {
    order: OrderDetails;
    refetch?: () => void | Promise<void>;
  };
}

export const SetProviderInfoDialog: FC<SetProviderInfoDialogProps> = ({
  resolve,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: OrderProviderInfoRequest) => {
      await marketplaceOrdersSetProviderInfo({
        path: { uuid: resolve.order.uuid },
        body: {
          provider_message: formData.provider_message,
          provider_message_url: formData.provider_message_url || '',
          provider_message_attachment: fileSerializer(
            formData.provider_message_attachment?.[0],
          ),
        },
        ...formDataOptions,
      });
    },
    onSuccess: async () => {
      showSuccess(translate('Provider info has been saved.'));
      if (resolve.refetch) await resolve.refetch();
      closeDialog();
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to save provider info.'));
    },
  });

  const initialValues = {
    provider_message: resolve.order.provider_message || '',
    provider_message_url: resolve.order.provider_message_url || '',
  };

  return (
    <Form
      onSubmit={(values) => mutate(values)}
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
                  submitting={isPending}
                  label={translate('Send')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup label={translate('Message')}>
              <Field
                name="provider_message"
                component={TextField as any}
                placeholder={translate('Enter a message for the customer...')}
              />
            </FormGroup>
            <FormGroup label={translate('URL')}>
              <Field
                name="provider_message_url"
                component={StringField as any}
                placeholder="https://"
              />
            </FormGroup>
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
