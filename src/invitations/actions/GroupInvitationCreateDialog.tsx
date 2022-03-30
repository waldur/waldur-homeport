import { Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { GROUP_INVITATION_CREATE_FORM_ID } from '@waldur/invitations/actions/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { useGroupInvitationCreateDialog } from './hooks';
import { ProjectGroup } from './ProjectGroup';
import { RoleGroup } from './RoleGroup';
import { InvitationContext } from './types';

interface OwnProps {
  resolve: { context: InvitationContext };
}

export const GroupInvitationCreateDialog = reduxForm<{}, OwnProps>({
  form: GROUP_INVITATION_CREATE_FORM_ID,
})(({ resolve: { context }, submitting, handleSubmit }) => {
  const { createInvitation, roles, projectEnabled } =
    useGroupInvitationCreateDialog(context);
  return (
    <form onSubmit={handleSubmit(createInvitation)}>
      <Modal.Header>
        <Modal.Title>{translate('Create group invitation')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {<RoleGroup roles={roles} />}
        {projectEnabled && (
          <ProjectGroup customer={context.customer} disabled={submitting} />
        )}
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton
          block={false}
          label={translate('Submit')}
          submitting={submitting}
        />
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
