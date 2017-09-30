import template from './appstore-project-selector.html';

const appstoreProjectSelector = {
  template,
  bindings: {
    projects: '<',
    selectedProject: '=',
    createProject: '&'
  },
  controller: class {
    $onInit() {
      if(this.projects && this.projects.length && this.projects.length === 1) {
        this.selectedProject = this.projects[0];
      }
    }
  }
};

export default appstoreProjectSelector;
