import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { GROUP_INVITATION_CREATE_FORM_ID } from '@waldur/invitations/actions/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { Role } from '@waldur/permissions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { InvitationService } from '../InvitationService';

import { ProjectGroup } from './ProjectGroup';
import { RoleGroup } from './RoleGroup';

interface OwnProps {
  resolve: { refetch(): void; roles: Role[] };
}

interface GroupInvitationCreateFormData {
  role: Role;
  project?: Project;
}

export const GroupInvitationCreateDialog = reduxForm<
  GroupInvitationCreateFormData,
  OwnProps
>({
  form: GROUP_INVITATION_CREATE_FORM_ID,
})(({ resolve: { refetch, roles }, submitting, handleSubmit }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);

  const createInvitation = useCallback(
    async (formData: GroupInvitationCreateFormData) => {
      try {
        await InvitationService.createGroupInvitation({
          role: formData.role.uuid,
          scope:
            formData.role.content_type === 'project'
              ? formData.project.url
              : customer.url,
        });
        dispatch(closeModalDialog());
        dispatch(showSuccess('Group invitation has been created.'));
        if (refetch) {
          refetch();
        }
      } catch (e) {
        dispatch(showErrorResponse(e, 'Unable to create group invitation.'));
      }
    },
    [dispatch, customer, refetch],
  );

  return (
    <form onSubmit={handleSubmit(createInvitation)}>
      <Modal.Header>
        <Modal.Title>{translate('Create group invitation')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <RoleGroup roles={roles} />
        <ProjectGroup customer={customer} disabled={submitting} />
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton />
        <SubmitButton
          block={false}
          label={translate('Submit')}
          submitting={submitting}
        />
      </Modal.Footer>
    </form>
  );
});
