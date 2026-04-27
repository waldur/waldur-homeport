import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { required } from '@/core/validators';
import { SubmitButton, TextField } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

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
              <CloseDialogButton variant="tertiary" className="flex-equal" />

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
              placeholder={translate('Enter a comment...')}
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
