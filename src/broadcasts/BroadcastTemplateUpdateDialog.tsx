import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  broadcastMessageTemplatesUpdate,
  MessageTemplate,
} from 'waldur-js-client';

import { BroadcastTemplateForm } from '@/broadcasts/BroadcastTemplateForm';
import { BROADCAST_TEMPLATE_CREATE_FORM_ID } from '@/broadcasts/constants';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface OwnProps {
  refetch?(): void;
  resolve;
}

const enhance = reduxForm<MessageTemplate, OwnProps>({
  form: BROADCAST_TEMPLATE_CREATE_FORM_ID,
});

export const BroadcastTemplateUpdateDialog = connect<{}, {}, OwnProps>(
  (_, ownProps: OwnProps) => ({
    initialValues: ownProps.resolve.template,
  }),
)(
  enhance(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();

    const callback = useCallback(
      async (formData: MessageTemplate) => {
        try {
          await broadcastMessageTemplatesUpdate({
            path: { uuid: formData.uuid },
            body: formData,
          });
          await resolve.refetch();
          dispatch(
            showSuccess(translate('Broadcast template has been updated.')),
          );
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to update a broadcast template.'),
            ),
          );
        }
      },
      [dispatch, resolve],
    );

    return (
      <form onSubmit={handleSubmit(callback)}>
        <ModalDialog
          title={translate('Update a broadcast template')}
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
