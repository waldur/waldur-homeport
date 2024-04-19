import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SubmitButton, TextField } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OwnProps {
  resolve: { title?; onSubmit; value? };
}

interface FormData {
  comment: string;
}

export const CommentFormDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: { comment: ownProps.resolve.value },
}))(
  reduxForm<FormData, OwnProps>({
    form: 'ReviewCommentForm',
  })((props) => {
    return (
      <form onSubmit={props.handleSubmit(props.resolve.onSubmit)}>
        <ModalDialog
          title={props.resolve.title || translate('Add comment')}
          closeButton
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Save')}
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <TextField
              label={translate('Comment')}
              name="comment"
              required
              validate={required}
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
