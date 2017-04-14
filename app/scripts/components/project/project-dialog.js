import template from './project-dialog.html';

const projectDialog = {
  template: template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  }
};

export default projectDialog;
