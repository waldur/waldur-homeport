import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { updateBroadcastTemplate } from '@waldur/broadcasts/api';
import { BroadcastTemplateForm } from '@waldur/broadcasts/BroadcastTemplateForm';
import { BROADCAST_TEMPLATE_CREATE_FORM_ID } from '@waldur/broadcasts/constants';
import { BroadcastTemplateFormData } from '@waldur/broadcasts/types';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface OwnProps {
  submitting: boolean;
  initialValues?: any;
  refetch?(): void;
  resolve;
}

const enhance = reduxForm<BroadcastTemplateFormData, OwnProps>({
  form: BROADCAST_TEMPLATE_CREATE_FORM_ID,
});

export const BroadcastTemplateUpdateDialog = connect(
  (_, ownProps: OwnProps) => ({
    initialValues: ownProps.resolve.template,
  }),
)(
  enhance(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();

    const callback = useCallback(
      async (formData: BroadcastTemplateFormData) => {
        try {
          await updateBroadcastTemplate(formData.uuid, formData);
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
      <ModalDialog title={translate('Update a broadcast template')}>
        <form onSubmit={handleSubmit(callback)}>
          <BroadcastTemplateForm submitting={submitting} />
        </form>
      </ModalDialog>
    );
  }),
);
