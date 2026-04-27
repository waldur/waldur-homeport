import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  broadcastMessageTemplatesCreate,
  MessageTemplateRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormContainer, StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { BroadcastFormData } from './types';

export const BroadcastSaveAsTemplateDialog = reduxForm<
  MessageTemplateRequest,
  { resolve: { refetch; broadcastData: BroadcastFormData } }
>({
  form: 'BroadcastSaveAsTemplateDialog',
})(({ submitting, handleSubmit, resolve }) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    async (formData: MessageTemplateRequest) => {
      try {
        await broadcastMessageTemplatesCreate({
          body: {
            ...formData,
            ...resolve.broadcastData,
          },
        });
        await resolve.refetch();
        dispatch(
          showSuccess(translate('Broadcast has been saved as a template.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to save a broadcast as a template.'),
          ),
        );
      }
    },
    [dispatch, resolve],
  );

  return (
    <ModalDialog title={translate('Create a broadcast template')}>
      <form onSubmit={handleSubmit(callback)}>
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
