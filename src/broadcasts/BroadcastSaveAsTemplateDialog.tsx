import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  broadcastMessageTemplatesCreate,
  MessageTemplateRequest,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const BroadcastCreateDialog = lazyComponent(() =>
  import('./BroadcastCreateDialog').then((module) => ({
    default: module.BroadcastCreateDialog,
  })),
);

export const BroadcastSaveAsTemplateDialog = reduxForm<
  MessageTemplateRequest,
  { resolve: { refetch; broadcastData } }
>({
  form: 'BroadcastSaveAsTemplateDialog',
})(({ submitting, handleSubmit, resolve }) => {
  const dispatch = useDispatch();
  const backToBroadcast = (broadcastData) =>
    dispatch(
      openModalDialog(BroadcastCreateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch: resolve.refetch,
        },
        initialValues: broadcastData,
        size: 'lg',
      }),
    );
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
          showSuccess(translate('Broadcast has been save as a template.')),
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

          <div className="d-flex justify-content-between">
            <Button
              onClick={() => backToBroadcast(resolve.broadcastData)}
              variant="secondary"
            >
              <span className="svg-icon svg-icon-2">
                <ArrowLeftIcon />
              </span>{' '}
              {translate('Back')}
            </Button>
            <SubmitButton submitting={submitting} label={translate('Save')} />
          </div>
        </FormContainer>
      </form>
    </ModalDialog>
  );
});
