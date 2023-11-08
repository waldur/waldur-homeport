import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { createBroadcastTemplate } from '@waldur/broadcasts/api';
import { BroadcastTemplateForm } from '@waldur/broadcasts/BroadcastTemplateForm';
import { BroadcastTemplateFormData } from '@waldur/broadcasts/types';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { BROADCAST_TEMPLATE_CREATE_FORM_ID } from './constants';

export const BroadcastTemplateCreateDialog = connect()(
  reduxForm<BroadcastTemplateFormData, { resolve: { refetch } }>({
    form: BROADCAST_TEMPLATE_CREATE_FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const callback = useCallback(
      async (formData: BroadcastTemplateFormData) => {
        try {
          await createBroadcastTemplate(formData);
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
      <ModalDialog title={translate('Create a broadcast template')}>
        <form onSubmit={handleSubmit(callback)}>
          <BroadcastTemplateForm submitting={submitting} />
        </form>
      </ModalDialog>
    );
  }),
);
