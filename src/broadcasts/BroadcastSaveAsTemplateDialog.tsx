import { reduxForm } from 'redux-form';
import {
  broadcastMessageTemplatesCreate,
  MessageTemplateRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormContainer, StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { BroadcastFormData } from './types';

export const BroadcastSaveAsTemplateDialog = reduxForm<
  MessageTemplateRequest,
  { resolve: { refetch; broadcastData: BroadcastFormData } }
>({
  form: 'BroadcastSaveAsTemplateDialog',
})(({ submitting, handleSubmit, resolve }) => {
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
    <ModalDialog title={translate('Create a broadcast template')}>
      <form
        onSubmit={handleSubmit((values) => saveMutation.mutateAsync(values))}
      >
        <FormContainer submitting={submitting}>
          <StringField
            name="name"
            label={translate('Name')}
            maxLength={150}
            required={true}
            validate={required}
          />

          <div className="d-flex justify-content-end gap-2">
            <CloseDialogButton />
            <SubmitButton submitting={submitting} label={translate('Save')} />
          </div>
        </FormContainer>
      </form>
    </ModalDialog>
  );
});
