import template from './ansible-job-details.html';

const ansbileJobDetails = {
  template: template,
  controller: class AnsbileJobDetailsController {
    // ngInject
    constructor($stateParams, AnsibleJobsService) {
      this.$stateParams = $stateParams;
      this.AnsibleJobsService = AnsibleJobsService;
    }

    $onInit() {
      this.loading = true;
      this.loadAnsibleJob().finally(() => {
        this.loading = false;
      });
    }

    loadAnsibleJob() {
      return this.AnsibleJobsService.$get(this.$stateParams.jobId)
        .then(job => this.job = job);
    }
  }
};

export default ansbileJobDetails;
