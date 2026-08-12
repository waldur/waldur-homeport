import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  Issue,
  supportCommentsUpdate,
  supportIssuesComment,
} from 'waldur-js-client';

import { getUUID } from '@/core/utils';
import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CannedResponseSelector } from '@/provider-helpdesk/canned-responses/CannedResponseSelector';

import { ISSUE_COMMENTS_QUERY_KEY } from './constants';
import { Comment } from './types';

interface CommentFormData {
  description: string;
}

interface CommentFormDialogProps {
  resolve: { comment?: Comment; issue?: Issue };
}

export const CommentFormDialog: FC<CommentFormDialogProps> = (props) => {
  const isEdit = Boolean(props.resolve?.comment);
  const issue = props.resolve?.issue;

  const commentMutation = useManagedMutation<any, any, CommentFormData>({
    mutationFn: (data) => {
      if (isEdit) {
        return supportCommentsUpdate({
          path: { uuid: props.resolve.comment.uuid },
          body: {
            is_public: true,
            description: data.description,
          },
        });
      } else {
        return supportIssuesComment({
          path: { uuid: issue.uuid },
          body: {
            is_public: true,
            description: data.description,
          },
        });
      }
    },
    errorMessage: isEdit
      ? translate('Unable to edit comment.')
      : translate('Unable to post comment.'),
    invalidateQueries: [
      {
        queryKey: [
          ISSUE_COMMENTS_QUERY_KEY,
          isEdit ? props.resolve.comment.issue : issue.url,
        ],
      },
    ],
  });

  const initialValues = useMemo(() => {
    return props.resolve?.comment
      ? { description: props.resolve.comment.description }
      : {};
  }, [props.resolve]);

  // Provider (routed child) issues carry a provider_helpdesk; only those get the
  // canned-response picker, and only when replying (not when editing a comment).
  const helpdeskUuid =
    !isEdit && issue?.provider_helpdesk
      ? getUUID(issue.provider_helpdesk)
      : null;
  const cannedResponseContext = {
    customer_name: issue?.customer_name ?? '',
    caller_name: issue?.caller_full_name ?? '',
    key: issue?.key ?? '',
    summary: issue?.summary ?? '',
  };

  return (
    <Form<CommentFormData>
      onSubmit={(values) => commentMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, pristine, form }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit ? translate('Change comment') : translate('Add comment')
            }
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="flex-equal" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid || submitting || pristine}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            {helpdeskUuid && (
              <CannedResponseSelector
                helpdeskUuid={helpdeskUuid}
                context={cannedResponseContext}
                onInsert={(text) => {
                  const current = form.getState().values.description ?? '';
                  form.change(
                    'description',
                    current ? `${current}\n\n${text}` : text,
                  );
                }}
              />
            )}
            <TextGroup
              name="description"
              spaceless
              hideLabel
              placeholder={translate('Enter a comment...')}
              validate={required}
              autoFocus
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
