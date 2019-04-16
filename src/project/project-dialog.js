import template from './project-dialog.html';

const projectDialog = {
  template: template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class ProjectDialogController {
    // @ngInject
    constructor(features) {
      this.features = features;
    }

    $onInit() {
      this.project = this.resolve.project;
      this.showProviders = !this.features.isVisible('marketplace');
    }
  }
};

export default projectDialog;
