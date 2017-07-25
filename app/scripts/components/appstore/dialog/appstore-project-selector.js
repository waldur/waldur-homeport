import template from './appstore-project-selector.html';

const appstoreProjectSelector = {
  template,
  bindings: {
    projects: '<',
    selectedProject: '<',
    createProject: '&'
  }
};

export default appstoreProjectSelector;
