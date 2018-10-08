import template from './ansible-job-details.html';

const ansbileJobDetails = {
  template: template,
  controller: class AnsbileJobDetailsController {
    // @ngInject
    constructor($stateParams, $state, $interval, $scope, ENV, AnsibleJobsService, BreadcrumbsService) {
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.$interval = $interval;
      this.$scope = $scope;
      this.ENV = ENV;
      this.AnsibleJobsService = AnsibleJobsService;
      this.BreadcrumbsService = BreadcrumbsService;
    }

    $onInit() {
      this.loading = true;
      this.pollingPromise = this.startPolling();
    }

    $onDestroy() {
      this.$interval.cancel(this.pollingPromise);
    }

    startPolling() {
      this.fetchJob();
      return this.$interval(this.fetchJob.bind(this), this.ENV.resourceDetailInterval * 1000);
    }

    fetchJob() {
      this.AnsibleJobsService.$get(this.$stateParams.jobId)
        .then(job => this.job = job)
        .then(() => this.refreshBreadcrumbs())
        .then(() => this.$scope.$emit('refreshAnsibleResourcesList'))
        .then(() => this.loading = false)
        .catch(response => {
          if (response.status === 404) {
            this.$state.go('errorPage.notFound');
          }
        });
    }

    refreshBreadcrumbs() {
      this.BreadcrumbsService.items = [
        {
          label: gettext('Project workspace'),
          state: 'project.details',
          params: {
            uuid: this.job.project_uuid
          }
        },
        {
          label: gettext('Resources')
        },
        {
          label: gettext('Applications'),
          state: 'project.resources.ansible.list',
          params: {
            uuid: this.job.project_uuid
          }
        }
      ];
    }
  }
};

export default ansbileJobDetails;
