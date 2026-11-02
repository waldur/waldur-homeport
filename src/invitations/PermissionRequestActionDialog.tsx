import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useRef } from 'react';
import { Form } from 'react-final-form';
import type { PermissionRequest } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';

import {
  useApprovePermissionRequest,
  useRejectPermissionRequest,
} from './useUserPermissionRequestActions';

interface OwnProps {
  resolve: {
    permissionRequest: PermissionRequest;
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
                    className="w-[150px]"
                    onClick={() => {
                      actionRef.current = 'reject';
                      handleSubmit();
                    }}
                    label={translate('Decline')}
                    iconNode={<XCircleIcon weight="bold" />}
                  />
                  <SubmitButton
                    submitting={isApproving}
                    disabled={invalid || isPending}
                    className="w-[150px]"
                    onClick={() => {
                      actionRef.current = 'approve';
                      handleSubmit();
                    }}
                    label={translate('Approve')}
                    iconNode={<CheckCircleIcon weight="bold" />}
                  />
                </>
              )
            }
          >
            <div className="flex flex-col gap-3">
              <PropertyList variant="summary" className="flex flex-col gap-3">
                <PropertyItem
                  label={translate('Name')}
                  value={permissionRequest.created_by_full_name}
                />
                <PropertyItem
                  label={translate('Email')}
                  value={permissionRequest.created_by_email}
                />
                <PropertyItem
                  label={translate('Organization')}
                  value={permissionRequest.customer_name}
                />
                {permissionRequest.role_name.startsWith('PROJECT.') && (
                  <>
                    <PropertyItem
                      label={translate('Project')}
                      value={permissionRequest.scope_name}
                    />
                    <PropertyItem
                      label={translate('Project role')}
                      value={
                        permissionRequest.role_description ||
                        permissionRequest.role_name
                      }
                    />
                    <PropertyItem
                      label={translate('Project name template')}
                      value={permissionRequest.project_name_template}
                      labelTooltipLen={false}
                    />
                    <PropertyItem
                      label={translate('Requested project name')}
                      value={permissionRequest.project_name}
                    />
                    <PropertyItem
                      label={translate('Requested project description')}
                      value={permissionRequest.project_description}
                    />
                  </>
                )}
                <PropertyItem
                  label={translate('Date of request')}
                  value={propVal.date(permissionRequest.created, {
                    precision: 'datetime',
                  })}
                />
                {readOnly && (
                  <>
                    <PropertyItem
                      label={translate('Reviewed at')}
                      value={propVal.date(permissionRequest.reviewed_at, {
                        precision: 'datetime',
                      })}
                    />
                    <PropertyItem
                      label={translate('Review comment')}
                      value={permissionRequest.review_comment}
                    />
                  </>
                )}
              </PropertyList>
            </div>
            {!readOnly && <hr />}
            {!readOnly && (
              <div>
                <TextGroup
                  name="comment"
                  label={translate('Reason')}
                  placeholder={translate('Enter a message...')}
                  description={translate(
                    'Optionally provide a reason to improve transparency and record decisions.',
                  )}
                  maxLength={150}
                  rows={4}
                  space={3}
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
