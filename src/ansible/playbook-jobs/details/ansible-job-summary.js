import template from './ansible-job-summary.html';

const ansibleJobSummary = {
  template,
  bindings: {
    job: '<',
  },
  controller: class Controller {
    // @ngInject
    constructor($state, AnsibleJobsService, resourcesService, ncUtilsFlash) {
      this.$state = $state;
      this.AnsibleJobsService = AnsibleJobsService;
      this.resourcesService = resourcesService;
      this.ncUtilsFlash = ncUtilsFlash;
    }

    get hasArguments() {
      return Object.keys(this.job.arguments).length > 0;
    }

    get canRemove() {
      return ['OK', 'Erred'].includes(this.job.state);
    }

    remove() {
      if (confirm('Please confirm that you want to delete this application. All related virtual machines will be removed.')) {
        return this.AnsibleJobsService.$deleteByUrl(this.job.url).then(() => {
          this.AnsibleJobsService.clearAllCacheForCurrentEndpoint();
          this.resourcesService.clearAllCacheForCurrentEndpoint();
          this.ncUtilsFlash.success(gettext('Application has been deleted'));
          return this.$state.go('project.resources.ansible.list', {
            uuid: this.job.project_uuid
          });
        }).catch(response => {
          this.ncUtilsFlash.errorFromResponse(response, gettext('Unable to delete application'));
        });
      }
    }
  }
};

export default ansibleJobSummary;
