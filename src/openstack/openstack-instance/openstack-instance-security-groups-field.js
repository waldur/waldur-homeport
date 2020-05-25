import store from '@waldur/store/store';

import { SecurityGroupsDialog } from '../openstack-security-groups/SecurityGroupsDialog';

import template from './openstack-instance-security-groups-field.html';

const openstackInstanceSecurityGroupsField = {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: class FieldController {
    // @ngInject
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    openDetailsDialog() {
      const securityGroups = this.model[this.field.name].map(
        choice => choice.object,
      );
      store.dispatch(SecurityGroupsDialog, {
        resolve: {
          securityGroups: () => securityGroups,
        },
        size: 'lg',
      });
    }
  },
};

export default openstackInstanceSecurityGroupsField;
