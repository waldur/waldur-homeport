import { post } from '@waldur/core/api';

class InvitationServiceClass {
  createInvitation(payload) {
    return post('/user-invitations/', payload);
  }

  check(invitation_uuid) {
    return this.executeAction(invitation_uuid, 'check');
  }

  accept(invitation_uuid, replace_email) {
    return this.executeAction(invitation_uuid, 'accept', {
      replace_email: replace_email,
    });
  }

  cancel(invitation_uuid) {
    return this.executeAction(invitation_uuid, 'cancel');
  }

  resend(invitation_uuid) {
    return this.executeAction(invitation_uuid, 'send');
  }

  approve(token) {
    return post(`/user-invitations/approve/`, {
      token,
    });
  }

  reject(token) {
    return post(`/user-invitations/reject/`, {
      token,
    });
  }

  executeAction(invitation_uuid, action, data?) {
    return post(`/user-invitations/${invitation_uuid}/${action}/`, data);
  }
}

export const InvitationService = new InvitationServiceClass();
