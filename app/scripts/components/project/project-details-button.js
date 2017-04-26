import template from './project-details-button.html';

const projectDetailsButton = {
  template: template,
  bindings: {
    project: '<',
  },
  controller: class ProjectDetailsButtonController {
    constructor($uibModal) {
      // @ngInject
      this.$uibModal = $uibModal;
    }

    showDetails() {
      this.$uibModal.open({
        component: 'projectDialog',
        size: 'lg',
        resolve: {
          project: () => this.project
        }
      });
    }
  }
};

export default projectDetailsButton;
