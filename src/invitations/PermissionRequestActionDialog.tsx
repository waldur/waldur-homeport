import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { formatDateTime } from '@/core/dateUtils';
import { FormContainer, SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { USER_PERMISSION_REQUESTS_ACTION_FORM_ID } from '@/invitations/constants';
import { ModalDialog } from '@/modal/ModalDialog';
import { Field } from '@/resource/summary';

import {
  useApprovePermissionRequest,
  useRejectPermissionRequest,
} from './useUserPermissionRequestActions';

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
  const { approveRequest, isPending: isApproving } =
    useApprovePermissionRequest(permissionRequest, props.resolve.refetch);
  const { rejectRequest, isPending: isRejecting } = useRejectPermissionRequest(
    permissionRequest,
    props.resolve.refetch,
  );
  const isPending = isApproving || isRejecting;
  return (
    <ModalDialog
      title={translate('Request review')}
      footer={
        !readOnly && (
          <>
            <SubmitButton
              submitting={isRejecting}
              disabled={props.invalid || isPending}
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
              submitting={isApproving}
              disabled={props.invalid || isPending}
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
            {permissionRequest.project_name && (
              <Field
                label={translate('Requested project name')}
                value={permissionRequest.project_name}
              />
            )}
            {permissionRequest.project_description && (
              <Field
                label={translate('Requested project description')}
                value={permissionRequest.project_description}
              />
            )}
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
        <FormContainer submitting={isPending} className="size-lg">
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
