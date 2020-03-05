import template from './slurm-allocation-details-dialog.html';

const slurmAllocationDetailsDialog = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
};

export default slurmAllocationDetailsDialog;
