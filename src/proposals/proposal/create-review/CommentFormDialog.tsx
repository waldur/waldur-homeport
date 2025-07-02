import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SubmitButton, TextField } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
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
          title={
            props.resolve.title
              ? translate('Comment about "{name}"', {
                  name: props.resolve.title,
                })
              : translate('Add comment')
          }
          subtitle={
            props.resolve.title
              ? translate('Please add a comment for the "{name}"', {
                  name: props.resolve.title,
                })
              : null
          }
          footer={
            <>
              <CloseDialogButton
                variant="outline btn-outline-default"
                className="flex-equal"
              />

              <SubmitButton
                disabled={props.invalid || props.pristine}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-equal"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            <TextField
              label={translate('Comment')}
              placeholder={translate('Enter a comment') + '...'}
              name="comment"
              required
              validate={required}
              hideLabel
              spaceless
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
