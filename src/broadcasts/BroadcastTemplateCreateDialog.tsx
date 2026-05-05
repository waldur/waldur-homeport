import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  broadcastMessageTemplatesCreate,
  MessageTemplateRequest,
} from 'waldur-js-client';

import { BroadcastTemplateForm } from '@/broadcasts/BroadcastTemplateForm';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const BroadcastTemplateCreateDialog: FC<{
  resolve: { refetch };
}> = ({ resolve }) => {
  const callbackMutation = useManagedMutation<any, any, MessageTemplateRequest>(
    {
      mutationFn: (formData) =>
        broadcastMessageTemplatesCreate({
          body: formData,
        }),
      successMessage: translate('Broadcast template has been created.'),
      errorMessage: translate('Unable to create a broadcast template.'),
      refetch: resolve.refetch,
    },
  );

  return (
    <Form<MessageTemplateRequest>
      onSubmit={(values) => callbackMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create a broadcast template')}
            footer={
              <SubmitButton submitting={submitting} label={translate('Save')} />
            }
          >
            <BroadcastTemplateForm />
          </ModalDialog>
        </form>
      )}
    />
  );
};
