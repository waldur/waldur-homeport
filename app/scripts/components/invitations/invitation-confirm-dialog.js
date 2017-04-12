import template from './invitation-confirm-dialog.html';

const invitationConfirmDialog = {
  template,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};

export default invitationConfirmDialog;
