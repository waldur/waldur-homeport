import template from './ansible-job-details.html';

const ansbileJobDetails = {
  template: template,
  controller: class AnsbileJobDetailsController {
    // ngInject
    constructor($stateParams, $interval, ENV, AnsibleJobsService) {
      this.$stateParams = $stateParams;
      this.$interval = $interval;
      this.ENV = ENV;
      this.AnsibleJobsService = AnsibleJobsService;
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
      return this.$interval(this.fetchJob.bind(this), this.ENV.singleResourcePollingTimeout);
    }

    fetchJob() {
      this.AnsibleJobsService.$get(this.$stateParams.jobId)
        .then(job => this.job = job)
        .finally(() => this.loading = false);
    }
  }
};

export default ansbileJobDetails;
