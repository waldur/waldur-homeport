import template from './project-dialog.html';

const projectDialog = {
  template: template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class ProjectDialogController {
    $onInit() {
      this.project = this.resolve.project;
    }
  }
};

export default projectDialog;
