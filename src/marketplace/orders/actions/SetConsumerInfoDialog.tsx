import { EnvelopeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOrdersSetConsumerInfo,
  type OrderConsumerInfoRequest,
  type OrderDetails,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { decodeFileName } from '@/core/utils';
import { SubmitButton, TextField } from '@/form';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface SetConsumerInfoDialogProps {
  resolve: {
    order: OrderDetails;
    refetch?: () => void | Promise<void>;
  };
}

export const SetConsumerInfoDialog: FC<SetConsumerInfoDialogProps> = ({
  resolve,
}) => {
  const setConsumerMutation = useManagedMutation<
    any,
    any,
    OrderConsumerInfoRequest
  >({
    mutationFn: async (formData) => {
      await marketplaceOrdersSetConsumerInfo({
        path: { uuid: resolve.order.uuid },
        body: {
          consumer_message: formData.consumer_message,
          consumer_message_attachment: fileSerializer(
            formData.consumer_message_attachment?.[0],
          ),
        },
        ...formDataOptions,
      });
    },
    successMessage: translate('Response has been sent.'),
    errorMessage: translate('Unable to send response.'),
    refetch: resolve.refetch,
  });

  const initialValues = {
    consumer_message: resolve.order.consumer_message || '',
  };

  return (
    <Form
      onSubmit={(values) => setConsumerMutation.mutate(values)}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Respond to provider')}
            iconNode={<EnvelopeIcon weight="bold" />}
            iconColor="info"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={setConsumerMutation.isPending}
                  label={translate('Send')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup label={translate('Message')}>
              <Field
                name="consumer_message"
                component={TextField}
                placeholder={translate('Enter a message for the provider...')}
              />
            </FormGroup>
            <FormGroup label={translate('Attachment (PDF)')}>
              <Field name="consumer_message_attachment">
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
                      resolve.order.consumer_message_attachment && (
                        <AttachmentItem
                          attachment={{
                            file: resolve.order.consumer_message_attachment,
                            file_name: decodeFileName(
                              resolve.order.consumer_message_attachment
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
