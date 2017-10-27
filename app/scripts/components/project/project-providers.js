import template from './project-providers.html';

const projectProviders = {
  template,
  bindings: {
    project: '<',
  },
  controller: class ProjectProvidersController {
    // @ngInject
    constructor(ProviderProjectsService) {
      this.service = ProviderProjectsService;
    }

    $onInit() {
      this.loading = true;
      this.service.loadLinks(this.project)
        .then(context => {
          this.choices = context.choices;
          this.canManage = context.canManage;
        }).finally(() => this.loading = false);
    }

    save() {
      return this.service.saveLinks(this.project, this.choices);
    }
  }
};

export default projectProviders;
