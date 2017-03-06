import template from './openstack-instance-floating-ip.html';

export default {
  template: template,
  bindings: {
    field: '<',
    model: '<'
  },
  controller: class OpenstackInstanceFloatingIp {
    // @ngInject
    constructor() {
      this.selectModel = null;
      this.selectList = [];
      this.selectList.push(
        {
          model: null,
          label: gettext('Skip assignment'),
          modelName: null
        },
        {
          model: true,
          label: gettext('Auto-assign'),
          modelName: 'allocate_floating_ip'
        }
      );

      this.field.choices && this.field.choices.forEach(choice => {
        this.selectList.push({
          model: choice,
          label: choice.address,
          modelName: this.field.name
        });
      }, this);
    }

    selectModelHandler() {
      delete this.model[this.field.name];
      delete this.model['allocate_floating_ip'];

      if (this.selectModel.modelName) {
        this.model[this.selectModel.modelName] = this.selectModel.model;
      }
    }
  },
};
