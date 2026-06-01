import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  broadcastMessageTemplatesCreate,
  MessageTemplateRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { BroadcastFormData } from './types';

interface BroadcastSaveAsTemplateDialogProps {
  resolve: {
    refetch: () => void;
    broadcastData: BroadcastFormData;
  };
}

export const BroadcastSaveAsTemplateDialog: FC<
  BroadcastSaveAsTemplateDialogProps
> = ({ resolve }) => {
  const saveMutation = useManagedMutation<any, any, MessageTemplateRequest>({
    mutationFn: (formData) =>
      broadcastMessageTemplatesCreate({
        body: {
          ...formData,
          ...resolve.broadcastData,
        },
      }),
    successMessage: translate('Broadcast has been saved as a template.'),
    errorMessage: translate('Unable to save a broadcast as a template.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<MessageTemplateRequest>
      onSubmit={(values) => saveMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create a broadcast template')}
            footer={
              <div className="d-flex justify-content-end gap-2">
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={translate('Save')}
                />
              </div>
            }
          >
            <StringGroup
              name="name"
              label={translate('Name')}
              required={true}
              validate={required}
              maxLength={150}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
