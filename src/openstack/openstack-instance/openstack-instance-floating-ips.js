import { translate } from '@waldur/i18n';

import { internalIpFormatter } from './openstack-instance-config';
import template from './openstack-instance-floating-ips.html';

const openstackInstanceFloatingIps = {
  template,
  bindings: {
    model: '<',
    field: '<',
    form: '<',
  },
  controller: class ComponentController {
    // @ngInject
    constructor($scope) {
      this.$scope = $scope;
      this.messages = {
        noSubnets: translate(
          'Instance is not connected to any internal subnets yet. Please connect it to internal subnet first.',
        ),
        noFloatingIps: translate(
          'Instance does not have any floating IPs yet.',
        ),
        selectSubnet: translate('Select connected subnet'),
        addItem: translate('Add'),
        deleteItem: translate('Delete'),
      };
    }

    $onInit() {
      this.items = this.model.floating_ips.map((floating_ip) => ({
        address: floating_ip.address,
        floating_ip: floating_ip.url,
        subnet: floating_ip.subnet,
        subnet_name: floating_ip.subnet_name,
      }));
      this.subnets = this.field.internal_ips_set.map((internal_ip) => ({
        display_name: internalIpFormatter({
          name: internal_ip.subnet_name,
          cidr: internal_ip.subnet_cidr,
        }),
        value: internal_ip.subnet,
      }));
      this.floating_ips = [
        {
          value: true,
          display_name: translate('Auto-assign floating IP'),
        },
        ...this.field.choices,
      ];
      this.$scope.$watch(
        () => this.items,
        () => {
          const items = this.items.filter((item) => item.subnet);
          this.model.floating_ips = items.map((item) => {
            if (item.floating_ip === true) {
              return {
                subnet: item.subnet,
              };
            } else {
              return {
                subnet: item.subnet,
                url: item.floating_ip,
              };
            }
          });
        },
        true,
      );
    }

    addItem() {
      this.items.push({
        floating_ip: true,
      });
      this.form.$setDirty();
    }

    deleteItem(item) {
      const index = this.items.indexOf(item);
      this.items.splice(index);
      this.form.$setDirty();
    }
  },
};

export default openstackInstanceFloatingIps;
