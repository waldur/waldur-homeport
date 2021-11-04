import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { USER_PERMISSION_REQUESTS_ACTION_FORM_ID } from '@waldur/invitations/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OwnProps {
  resolve: {
    title: string;
    submitRequest;
  };
}

const PurePermissionRequestActionDialog: FunctionComponent<
  InjectedFormProps & OwnProps & { handleSubmit; submitRequest }
> = (props) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={props.resolve.title}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Submit')}
          />
        </>
      }
    >
      <FormContainer submitting={props.submitting}>
        <TextField
          name="comment"
          label={translate('Comment')}
          maxLength={150}
          rows={4}
        />
      </FormContainer>
    </ModalDialog>
  </form>
);

const mapDispatchToProps = (_dispatch, ownProps: OwnProps) => ({
  submitRequest: (formData) =>
    ownProps.resolve.submitRequest(formData?.comment),
});

const connector = connect(null, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: USER_PERMISSION_REQUESTS_ACTION_FORM_ID,
  }),
);

export const PermissionRequestActionDialog = enhance(
  PurePermissionRequestActionDialog,
);
