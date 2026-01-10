import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { USER_PERMISSION_REQUESTS_ACTION_FORM_ID } from '@waldur/invitations/constants';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Field } from '@waldur/resource/summary';

import { useUserPermissionRequestActions } from './useUserPermissionRequestActions';

interface OwnProps {
  resolve: {
    permissionRequest;
    readOnly: boolean;
    refetch;
  };
}

const PurePermissionRequestActionDialog: FunctionComponent<
  InjectedFormProps & OwnProps & { handleSubmit }
> = (props) => {
  const permissionRequest = props.resolve.permissionRequest;
  const readOnly = props.resolve.readOnly;
  const { approveRequest, rejectRequest } = useUserPermissionRequestActions(
    permissionRequest,
    props.resolve.refetch,
  );

  return (
    <ModalDialog
      title={translate('Request review')}
      closeButton
      footer={
        !readOnly && (
          <>
            <SubmitButton
              submitting={props.submitting}
              disabled={props.invalid}
              variant="danger"
              className="w-150px"
              type="button"
              onClick={props.handleSubmit((values) => {
                rejectRequest(values.comment);
              })}
            >
              <span className="svg-icon svg-icon-2">
                <XCircleIcon weight="bold" />
              </span>
              {translate('Decline')}
            </SubmitButton>
            <SubmitButton
              submitting={props.submitting}
              disabled={props.invalid}
              className="w-150px"
              type="button"
              onClick={props.handleSubmit((values) => {
                approveRequest(values.comment);
              })}
            >
              <span className="svg-icon svg-icon-2">
                <CheckCircleIcon weight="bold" />
              </span>
              {translate('Approve')}
            </SubmitButton>
          </>
        )
      }
    >
      <div className="d-flex flex-column gap-4">
        <Field
          label={translate('Name')}
          value={permissionRequest.created_by_full_name}
        />
        <Field
          label={translate('Email')}
          value={permissionRequest.created_by_email}
        />
        <Field
          label={translate('Organization')}
          value={permissionRequest.customer_name}
        />
        {permissionRequest.role_name.startsWith('PROJECT.') && (
          <>
            <Field
              label={translate('Project')}
              value={permissionRequest.scope_name}
            />
            <Field
              label={translate('Project role')}
              value={
                permissionRequest.role_description ||
                permissionRequest.role_name
              }
            />
            <Field
              label={translate('Project name template')}
              value={permissionRequest.project_name_template}
              labelTooltipLen={false}
            />
          </>
        )}
        <Field
          label={translate('Date of request')}
          value={formatDateTime(permissionRequest.created)}
        />
        {readOnly && (
          <>
            <Field
              label={translate('Reviewed at')}
              value={formatDateTime(permissionRequest.reviewed_at)}
            />
            <Field
              label={translate('Review comment')}
              value={permissionRequest.review_comment}
            />
          </>
        )}
      </div>
      {!readOnly && <hr />}
      {!readOnly && (
        <FormContainer submitting={props.submitting} className="size-lg">
          <TextField
            name="comment"
            label={translate('Reason')}
            placeholder={translate('Enter a message...')}
            description={translate(
              'Optionally provide a reason to improve transparency and record decisions.',
            )}
            maxLength={150}
            rows={4}
            space={4}
          />
        </FormContainer>
      )}
    </ModalDialog>
  );
};

export const PermissionRequestActionDialog = reduxForm({
  form: USER_PERMISSION_REQUESTS_ACTION_FORM_ID,
})(PurePermissionRequestActionDialog);
