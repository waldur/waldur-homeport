import template from './openstack-instance-security-groups-field.html';

const openstackInstanceSecurityGroupsField = {
  template,
  bindings: {
    model: '<',
    field: '<'
  },
  controller: class FieldController {
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    openDetailsDialog() {
      const securityGroups = this.model[this.field.name].map(choice => choice.object);
      this.$uibModal.open({
        component: 'securityGroupsDialog',
        resolve: {
          securityGroups: () => securityGroups
        },
        size: 'lg'
      });
    }
  }
};

export default openstackInstanceSecurityGroupsField;
