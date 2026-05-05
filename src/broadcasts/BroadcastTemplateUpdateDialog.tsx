import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  broadcastMessageTemplatesUpdate,
  MessageTemplate,
} from 'waldur-js-client';

import { BroadcastTemplateForm } from '@/broadcasts/BroadcastTemplateForm';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const BroadcastTemplateUpdateDialog: FC<{
  resolve: { template; refetch };
}> = ({ resolve }) => {
  const callbackMutation = useManagedMutation<any, any, MessageTemplate>({
    mutationFn: (formData) =>
      broadcastMessageTemplatesUpdate({
        path: { uuid: formData.uuid },
        body: formData,
      }),
    successMessage: translate('Broadcast template has been updated.'),
    errorMessage: translate('Unable to update a broadcast template.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<MessageTemplate>
      onSubmit={(values) => callbackMutation.mutateAsync(values)}
      initialValues={resolve.template}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update a broadcast template')}
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
