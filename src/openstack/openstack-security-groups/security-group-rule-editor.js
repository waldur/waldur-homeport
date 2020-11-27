import cidrRegex from 'cidr-regex';

import { $q } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { loadSecurityGroupsResources } from '@waldur/openstack/api';

import template from './security-group-rule-editor.html';

const IPv4_CIDR_PATTERN = cidrRegex.v4({ exact: true });

const IPv6_CIDR_PATTERN = cidrRegex.v6({ exact: true });

const securityGroupRuleEditor = {
  template,
  bindings: {
    model: '<',
    field: '<',
    form: '<',
    context: '<',
  },
  controller: class SecurityGroupRuleEditorController {
    $onInit() {
      this.ethertypes = [
        { label: 'IPv4', value: 'IPv4' },
        { label: 'IPv6', value: 'IPv6' },
      ];
      this.protocols = [
        {
          label: translate('Any'),
          value: '',
        },
        {
          label: 'TCP',
          value: 'tcp',
        },
        {
          label: 'UDP',
          value: 'udp',
        },
        {
          label: 'ICMP',
          value: 'icmp',
        },
      ];
      this.directions = [
        { label: translate('Ingress'), value: 'ingress' },
        { label: translate('Egress'), value: 'egress' },
      ];
      if (!this.model[this.field.name]) {
        this.model[this.field.name] = [];
      }
      this.target = this.model[this.field.name];
      this.remote_groups = [];
      this.loading = true;
      const tenant =
        this.context.resource.resource_type === 'OpenStack.Tenant'
          ? this.context.resource.url
          : this.context.resource.tenant;
      $q.when(
        loadSecurityGroupsResources({
          tenant,
          field: ['name', 'url'],
          o: 'name',
        }),
      ).then((remote_groups) => {
        this.remote_groups = remote_groups;
        this.loading = false;
      });
    }

    getPortMin(rule) {
      if (rule.protocol === 'icmp' || !rule.protocol) {
        return -1;
      } else {
        return 1;
      }
    }

    getPortMax(rule) {
      if (!rule.protocol) {
        return -1;
      } else if (rule.protocol === 'icmp') {
        return 255;
      } else {
        return 65535;
      }
    }

    getToPortMin(rule) {
      return Math.max(this.getPortMin(rule), rule.from_port || -1);
    }

    addRule() {
      this.target.push({
        ethertype: this.ethertypes[0].value,
        protocol: this.protocols[0].value,
        direction: this.directions[0].value,
        from_port: -1,
        to_port: -1,
      });
      this.form.$setDirty();
    }

    deleteRule(rule) {
      const index = this.target.indexOf(rule);
      if (index !== -1) {
        this.target.splice(index, 1);
      }
      this.form.$setDirty();
    }

    isCidrInvalid(index) {
      const field = this.form[`rule_${index}_cidr`];
      return field && field.$invalid;
    }

    getPattern(rule) {
      if (rule.ethertype === 'IPv4') {
        return IPv4_CIDR_PATTERN;
      } else if (rule.ethertype === 'IPv6') {
        return IPv6_CIDR_PATTERN;
      }
    }

    getPatternTitle(index, rule) {
      if (!this.isCidrInvalid(index)) {
        return;
      }
      if (rule.ethertype === 'IPv4') {
        return translate('The value is not valid IP v4');
      } else if (rule.ethertype === 'IPv6') {
        return translate('The value is not valid IP v6');
      }
    }

    getCIDRPlaceholder(rule) {
      if (rule.ethertype === 'IPv4') {
        return '0.0.0.0/0';
      } else if (rule.ethertype === 'IPv6') {
        return '::/0';
      }
    }
  },
};

export default securityGroupRuleEditor;
