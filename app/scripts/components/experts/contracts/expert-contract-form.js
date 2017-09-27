import template from './expert-contract-form.html';

const expertContract = {
  template,
  bindings: {
    model: '=',
    form: '<',
    contractTemplate: '<',
    expert: '<',
    errors: '<',
  },
  controller: class ExpertContractController {
    $onInit() {
      this.loading = true;

      let sortedOptions = {};
      angular.forEach(this.expert.order, name => {
        sortedOptions[name] = this.expert.options[name];
      });

      this.expert.options = sortedOptions;
      this.tabs = [this.createTab(gettext('Details'), this.expert.options)];

      angular.forEach(this.contractTemplate.order, tabName => {
        let tab = this.contractTemplate.options[tabName];
        this.tabs.push(this.createTab(tab.label, tab.options));

        angular.forEach(tab.options, (option, name) => {
          option.name = name;
          if (option.default) {
            this.model[name] = option.default;
          }
        });
      });

      this.loading = false;
    }

    createTab(name, options) {
      return {
        label: name,
        options: options,
        required: Object.keys(options).some(name => options[name].required),
      };
    }
  }
};

export default expertContract;
