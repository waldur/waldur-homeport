import template from './openstack-instance-data-volume.html';

const openstackInstanceDataVolume = {
  template: template,
  controller: class FieldController {
    $onInit() {
      this.toggleField();
    }
    toggleField() {
      this.model[this.field.name] = this.model[this.field.name] === undefined ? this.field.min : undefined;
      this.active = this.model[this.field.name] !== undefined;
    }
  },
  bindings: {
    field: '<',
    model: '<',
    form: '<',
  },
};

export default openstackInstanceDataVolume;
