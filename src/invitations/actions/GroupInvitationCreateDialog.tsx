import { LinkIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import { userGroupInvitationsCreate } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { GROUP_INVITATION_CREATE_FORM_ID } from '@waldur/invitations/actions/constants';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Role } from '@waldur/permissions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvitationLinkField } from './InvitationLinkField';
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

  const [invitation, setInvitation] = useState(null);

  const createInvitation = useCallback(
    async (formData: GroupInvitationCreateFormData) => {
      try {
        const res = await userGroupInvitationsCreate({
          body: {
            role: formData.role.uuid,
            scope:
              formData.role.content_type === 'project'
                ? formData.project.url
                : customer.url,
          },
        });
        setInvitation(res.data);
        dispatch(showSuccess('Group invitation has been created.'));
        if (refetch) refetch();
      } catch (e) {
        dispatch(showErrorResponse(e, 'Unable to create group invitation.'));
      }
    },
    [dispatch, customer, refetch, setInvitation],
  );

  return (
    <form onSubmit={handleSubmit(createInvitation)}>
      <ModalDialog
        title={translate('Create group invitation')}
        iconNode={<UsersThreeIcon weight="bold" />}
        iconColor="success"
        closeButton
      >
        <div className="pb-5 mb-5 border-bottom">
          <RoleGroup roles={roles} />
          <ProjectGroup customer={customer} disabled={submitting} />
          <SubmitButton
            variant="secondary"
            submitting={submitting}
            invalid={Boolean(invitation)}
          >
            <span className="svg-icon svg-icon-2">
              <LinkIcon weight="bold" />
            </span>
            {translate('Generate link')}
          </SubmitButton>
        </div>
        <InvitationLinkField invitation={invitation} />
      </ModalDialog>
    </form>
  );
});
