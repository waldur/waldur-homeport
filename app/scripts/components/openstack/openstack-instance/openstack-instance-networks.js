import template from './openstack-instance-networks.html';
import { internalIpFormatter } from './openstack-instance-config';

const FLOATING_IP_CHOICES = [
  {
    value: '',
    display_name: gettext('Skip floating IP assignment'),
  },
  {
    value: true,
    display_name: gettext('Auto-assign floating IP'),
  }
];

const openstackInstanceNetworks = {
  template,
  bindings: {
    model: '<',
    field: '<',
    form: '<',
  },
  controller: class ComponentController {
    // @ngInject
    constructor($scope) {
      this.items = [];
      this.addItem();
      this.$scope = $scope;
    }

    $onInit() {
      this.initSubnetChoices();
      this.initFloatingIpChoices();
      this.initSubnetFromModel();
      this.$scope.$watch(() => this.items, () => {
        this.serializeSubnets();
        this.serializeFloatingIps();
      }, true);
    }

    initSubnetChoices() {
      this.subnets = this.field.choices.subnets.map(subnet => ({
        display_name: internalIpFormatter(subnet),
        value: subnet.url,
      }));

      if (this.subnets.length === 1) {
        this.items[0].subnet = this.subnets[0].value;
      }
    }

    serializeSubnets() {
      const items = this.getValidItems();
      this.model.internal_ips_set = items.map(item => ({
        subnet: item.subnet
      }));
    }

    initFloatingIpChoices() {
      const floating_ips = this.field.choices.floating_ips.map(floating_ip => ({
        display_name: floating_ip.address,
        value: floating_ip.url,
      }));
      this.floating_ips = FLOATING_IP_CHOICES.concat(floating_ips);
    }

    serializeFloatingIps() {
      const items = this.getValidItems();
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
    }

    getValidItems() {
      return this.items.filter(item => item.subnet);
    }

    initSubnetFromModel() {
      if (this.model.internal_ips_set) {
        this.items = this.model.internal_ips_set.map(item => ({
          floating_ip: '',
          subnet: item.subnet,
        }));
      }
    }

    getFreeSubnets(current_choice) {
      let used_choices = {};
      angular.forEach(this.items, item => {
        if (item.subnet && item.subnet !== current_choice) {
          used_choices[item.subnet] = true;
        }
      });
      return this.subnets.filter(choice => !used_choices[choice.value]);
    }

    hasFreeSubnets() {
      return this.getFreeSubnets().length > 0;
    }

    getFreeFloatingIps(current_choice) {
      let used_choices = {};
      angular.forEach(this.items, item => {
        if (item.floating_ip && item.floating_ip !== true && item.floating_ip !== current_choice) {
          used_choices[item.floating_ip] = true;
        }
      });
      return this.floating_ips.filter(choice => !used_choices[choice.value]);
    }

    addItem() {
      this.items.push({
        floating_ip: ''
      });
      this.form.$setDirty();
    }

    deleteItem(item) {
      const index = this.items.indexOf(item);
      this.items.splice(index, 1);
      this.form.$setDirty();
    }
  }
};

export default openstackInstanceNetworks;
