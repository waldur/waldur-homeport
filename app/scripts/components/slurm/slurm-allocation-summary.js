import template from './slurm-allocation-summary.html';

const slurmAllocationSummary = {
  template,
  bindings: {
    resource: '<'
  },
};

export default slurmAllocationSummary;
