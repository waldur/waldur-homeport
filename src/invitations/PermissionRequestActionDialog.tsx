import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useRef } from 'react';
import { Form } from 'react-final-form';

import { formatDateTime } from '@/core/dateUtils';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
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

export const PermissionRequestActionDialog: FunctionComponent<OwnProps> = (
  props,
) => {
  const permissionRequest = props.resolve.permissionRequest;
  const readOnly = props.resolve.readOnly;
  const { approveRequest, isPending: isApproving } =
    useApprovePermissionRequest(permissionRequest, props.resolve.refetch);
  const { rejectRequest, isPending: isRejecting } = useRejectPermissionRequest(
    permissionRequest,
    props.resolve.refetch,
  );
  const isPending = isApproving || isRejecting;

  const actionRef = useRef<'approve' | 'reject' | null>(null);

  const onSubmit = (values) => {
    if (actionRef.current === 'approve') {
      return approveRequest(values.comment);
    } else if (actionRef.current === 'reject') {
      return rejectRequest(values.comment);
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Request review')}
            footer={
              !readOnly && (
                <>
                  <SubmitButton
                    submitting={isRejecting}
                    disabled={invalid || isPending}
                    variant="danger"
                    className="w-150px"
                    type="button"
                    onClick={() => {
                      actionRef.current = 'reject';
                      handleSubmit();
                    }}
                  >
                    <span className="svg-icon svg-icon-2">
                      <XCircleIcon weight="bold" />
                    </span>
                    {translate('Decline')}
                  </SubmitButton>
                  <SubmitButton
                    submitting={isApproving}
                    disabled={invalid || isPending}
                    className="w-150px"
                    type="button"
                    onClick={() => {
                      actionRef.current = 'approve';
                      handleSubmit();
                    }}
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
              <div className="size-lg">
                <TextGroup
                  name="comment"
                  label={translate('Reason')}
                  placeholder={translate('Enter a message...')}
                  description={translate(
                    'Optionally provide a reason to improve transparency and record decisions.',
                  )}
                  maxLength={150}
                  rows={4}
                  space={4}
                  disabled={isPending}
                />
              </div>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
