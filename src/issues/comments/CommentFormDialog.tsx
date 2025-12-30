import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import {
  Issue,
  supportCommentsUpdate,
  supportIssuesComment,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse } from '@waldur/store/notify';

import { Comment } from './types';

const FORM_ID = 'ISSUE_COMMENTS_FORM_MAIN';
const COMMENT_FIELD = 'COMMENT';

interface CommentFormDialogOwnProps {
  resolve: { comment?: Comment; issue?: Issue };
}

interface CommentFormDialogProps
  extends
    InjectedFormProps<Record<string, string>, CommentFormDialogOwnProps>,
    CommentFormDialogOwnProps {}

const PureCommentFormDialog: FC<CommentFormDialogProps> = (props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const isEdit = Boolean(props.resolve?.comment);
  const issue = props.resolve?.issue;

  const onSubmit = async (data: { [key: string]: string }) => {
    if (isEdit) {
      try {
        await supportCommentsUpdate({
          path: { uuid: props.resolve.comment.uuid },
          body: {
            is_public: true,
            description: data[COMMENT_FIELD],
          },
        });
        queryClient.invalidateQueries({
          queryKey: ['issueComments', props.resolve.comment.issue],
        });
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to edit comment.')),
        );
      }
    } else {
      try {
        await supportIssuesComment({
          path: { uuid: issue.uuid },
          body: {
            is_public: true,
            description: data[COMMENT_FIELD],
          },
        });
        queryClient.invalidateQueries({
          queryKey: ['issueComments', issue.url],
        });
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to post comment.')),
        );
      }
    }
  };

  return (
    <form onSubmit={props.handleSubmit(onSubmit)}>
      <ModalDialog
        title={isEdit ? translate('Change comment') : translate('Add comment')}
        footer={
          <>
            <CloseDialogButton variant="tertiary" className="flex-equal" />
            <SubmitButton
              submitting={props.submitting}
              disabled={props.invalid || props.submitting}
              label={translate('Confirm')}
              className="btn btn-primary flex-equal"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <TextField
            name={COMMENT_FIELD}
            spaceless
            hideLabel
            placeholder={translate('Enter a comment...')}
            validate={required}
            autoFocus
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

export const CommentFormDialog = reduxForm<
  Record<string, string>,
  CommentFormDialogOwnProps
>({
  form: FORM_ID,
  destroyOnUnmount: true,
  initialValues: {},
})((props) => {
  const initialValues = props.resolve?.comment
    ? { [COMMENT_FIELD]: props.resolve.comment.description }
    : {};

  return <PureCommentFormDialog {...props} initialValues={initialValues} />;
});
