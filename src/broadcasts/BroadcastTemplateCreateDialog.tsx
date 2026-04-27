import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  broadcastMessageTemplatesCreate,
  MessageTemplateRequest,
} from 'waldur-js-client';

import { BroadcastTemplateForm } from '@/broadcasts/BroadcastTemplateForm';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { BROADCAST_TEMPLATE_CREATE_FORM_ID } from './constants';

export const BroadcastTemplateCreateDialog = connect()(
  reduxForm<MessageTemplateRequest, { resolve: { refetch } }>({
    form: BROADCAST_TEMPLATE_CREATE_FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const callback = useCallback(
      async (formData: MessageTemplateRequest) => {
        try {
          await broadcastMessageTemplatesCreate({
            body: formData,
          });
          await resolve.refetch();
          dispatch(
            showSuccess(translate('Broadcast template has been created.')),
          );
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to create a broadcast template.'),
            ),
          );
        }
      },
      [dispatch, resolve],
    );

    return (
      <form onSubmit={handleSubmit(callback)}>
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
