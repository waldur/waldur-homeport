import { Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { CivilNumberGroup } from './CivilNumberGroup';
import { EmailGroup } from './EmailGroup';
import { useInvitationCreateDialog } from './hooks';
import { LoadUserDetailsButton } from './LoadUserDetailsButton';
import { ProjectGroup } from './ProjectGroup';
import { RoleGroup } from './RoleGroup';
import { TaxNumberGroup } from './TaxNumberGroup';
import { InvitationContext } from './types';
import { UserDetailsGroup } from './UserDetailsGroup';

interface OwnProps {
  resolve: { context: InvitationContext };
}

export const InvitationCreateDialog = reduxForm<{}, OwnProps>({
  form: 'InvitationCreateDialog',
})(({ resolve: { context }, submitting, handleSubmit }) => {
  const {
    fetchUserDetailsCallback,
    fetchingUserDetails,
    userDetails,
    createInvitation,
    roleDisabled,
    roles,
    projectEnabled,
  } = useInvitationCreateDialog(context);
  const getRoles = () => {
    if (context.project) {
      return roles.slice(1);
    }
    return roles;
  };

  const disabled = submitting || fetchingUserDetails;
  return (
    <form onSubmit={handleSubmit(createInvitation)}>
      <Modal.Header>
        <Modal.Title>{translate('Invite user')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EmailGroup disabled={disabled} />
        {isFeatureVisible('invitations.conceal_civil_number') ? null : (
          <CivilNumberGroup disabled={disabled} />
        )}
        <TaxNumberGroup disabled={disabled} />
        <LoadUserDetailsButton
          loading={disabled}
          onClick={fetchUserDetailsCallback}
        />
        <UserDetailsGroup userDetails={userDetails} />
        {!roleDisabled && <RoleGroup roles={getRoles()} />}

        {projectEnabled && !context.project && (
          <ProjectGroup customer={context.customer} disabled={disabled} />
        )}
      </Modal.Body>
      <Modal.Footer>
        {!roleDisabled && (
          <SubmitButton
            block={false}
            label={translate('Invite user')}
            submitting={submitting}
          />
        )}
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
