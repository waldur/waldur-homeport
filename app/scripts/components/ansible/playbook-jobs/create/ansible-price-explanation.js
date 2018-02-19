import template from './ansible-price-explanation.html';

const ansiblePriceExplanation = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
  controller: class AnsiblePriceExplanationController {
    $onInit() {
      const { prices, requirements } = this.resolve.estimate;
      this.prices = {
        cpu: prices.cpu,
        ram: prices.ram * 1024,
        disk: prices.ram * 1024,
      };
      this.requirements = {
        cpu: requirements.cpu,
        ram: (requirements.ram / 1024).toFixed(2),
        disk: (requirements.ram / 1024).toFixed(2),
      };
      this.costs = {
        cpu: prices.cpu * requirements.cpu,
        ram: prices.ram * requirements.ram,
        disk: prices.disk * requirements.disk,
      };
    }
  }
};

export default ansiblePriceExplanation;
