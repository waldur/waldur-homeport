import template from './openstack-instance-networks.html';
import { internalIpFormatter } from './openstack-instance-config';

const FLOATING_IP_CHOICES = [
  {
    value: '',
    label: gettext('Skip floating IP assignment'),
  },
  {
    value: true,
    label: gettext('Auto-assign floating IP'),
  }
];

const openstackInstanceNetworks = {
  template,
  bindings: {
    model: '<',
    field: '<'
  },
  controller: class ComponentController {
    constructor($scope) {
      // @ngInject
      this.items = [];
      this.addItem();
      this.$scope = $scope;
    }

    $onInit() {
      this.subnets = this.field.choices.subnets.map(subnet => ({
        label: internalIpFormatter(subnet),
        value: subnet.url,
      }));
      const floating_ips = this.field.choices.floating_ips.map(floating_ip => ({
        label: floating_ip.address,
        value: floating_ip.url,
      }));
      this.floating_ips = FLOATING_IP_CHOICES.concat(floating_ips);
      this.$scope.$watch(() => this.items, () => {
        const items = this.items.filter(item => item.subnet);
        this.model.internal_ips_set = items.map(item => ({
          subnet: item.subnet
        }));
        this.model.floating_ips = items
          .filter(item => item.floating_ip !== '')
          .map(item => {
            // Auto-assign floating IP
            if (item.floating_ip === true) {
              return {
                subnet: item.subnet
              };
            } else {
              return {
                subnet: item.subnet,
                url: item.floating_ip,
              };
            }
          });
      }, true);
    }

    addItem() {
      this.items.push({
        floating_ip: ''
      });
    }

    deleteItem(item) {
      const index = this.items.indexOf(item);
      this.items.splice(index);
    }
  }
};

export default openstackInstanceNetworks;
