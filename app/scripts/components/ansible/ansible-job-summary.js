import template from './ansible-job-summary.html';

const ansibleJobSummary = {
  template,
  bindings: {
    job: '<',
  },
};

export default ansibleJobSummary;
