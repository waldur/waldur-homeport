import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  broadcastMessageTemplatesCreate,
  MessageTemplateRequest,
} from 'waldur-js-client';

import { BroadcastTemplateForm } from '@/broadcasts/BroadcastTemplateForm';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { BROADCAST_TEMPLATE_CREATE_FORM_ID } from './constants';

export const BroadcastTemplateCreateDialog = connect()(
  reduxForm<MessageTemplateRequest, { resolve: { refetch } }>({
    form: BROADCAST_TEMPLATE_CREATE_FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const callbackMutation = useManagedMutation<
      any,
      any,
      MessageTemplateRequest
    >({
      mutationFn: (formData) =>
        broadcastMessageTemplatesCreate({
          body: formData,
        }),
      successMessage: translate('Broadcast template has been created.'),
      errorMessage: translate('Unable to create a broadcast template.'),
      refetch: resolve.refetch,
    });

    return (
      <form
        onSubmit={handleSubmit((values) =>
          callbackMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          title={translate('Create a broadcast template')}
          footer={
            <SubmitButton submitting={submitting} label={translate('Save')} />
          }
        >
          <BroadcastTemplateForm submitting={submitting} />
        </ModalDialog>
      </form>
    );
  }),
);
