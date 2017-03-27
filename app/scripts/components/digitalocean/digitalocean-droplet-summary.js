const digitaloceanDropletSummary = {
  template: '<virtual-machine-summary resource="$ctrl.resource"/>',
  bindings: {
    resource: '<'
  }
};

export default digitaloceanDropletSummary;
