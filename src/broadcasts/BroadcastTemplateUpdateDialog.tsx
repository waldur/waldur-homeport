import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  broadcastMessageTemplatesUpdate,
  MessageTemplate,
} from 'waldur-js-client';

import { BroadcastTemplateForm } from '@/broadcasts/BroadcastTemplateForm';
import { BROADCAST_TEMPLATE_CREATE_FORM_ID } from '@/broadcasts/constants';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
      <form
        onSubmit={handleSubmit((values) =>
          callbackMutation.mutateAsync(values),
        )}
      >
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
