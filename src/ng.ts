import angular from 'angular';

import openstackBackupRestoreSummary from '@waldur/openstack/openstack-backup/openstack-backup-restore-summary';
import openstackInstanceFloatingIps from '@waldur/openstack/openstack-instance/openstack-instance-floating-ips';
import openstackInstanceNetworks from '@waldur/openstack/openstack-instance/openstack-instance-networks';
import securityGroupRuleEditor from '@waldur/openstack/openstack-security-groups/security-group-rule-editor';
import actionDialog from '@waldur/resource/actions/dialog/action-dialog';
import actionFieldBoolean from '@waldur/resource/actions/dialog/action-field-boolean';
import actionFieldDecimal from '@waldur/resource/actions/dialog/action-field-decimal';
import actionFieldInteger from '@waldur/resource/actions/dialog/action-field-integer';
import actionFieldMultiselect from '@waldur/resource/actions/dialog/action-field-multiselect';
import actionFieldSelect from '@waldur/resource/actions/dialog/action-field-select';
import actionFieldString from '@waldur/resource/actions/dialog/action-field-string';
import actionFieldText from '@waldur/resource/actions/dialog/action-field-text';
import actionField from '@waldur/resource/actions/dialog/ActionField';
import { FieldLabel } from '@waldur/resource/actions/dialog/FieldLabel';
import { HelpIcon } from '@waldur/resource/actions/dialog/HelpIcon';
import { ReactSelect } from '@waldur/resource/actions/dialog/ReactSelect';
import { react2angular } from '@waldur/shims/react2angular';

const module = angular.module('waldur', []);

module.component('openstackInstanceNetworks', openstackInstanceNetworks);
module.component('openstackInstanceFloatingIps', openstackInstanceFloatingIps);
module.component(
  'openstackBackupRestoreSummary',
  openstackBackupRestoreSummary,
);
module.component('securityGroupRuleEditor', securityGroupRuleEditor);
module.component('actionDialog', actionDialog);
module.component('actionField', actionField);
module.component('actionFieldBoolean', actionFieldBoolean);
module.component('actionFieldInteger', actionFieldInteger);
module.component('actionFieldDecimal', actionFieldDecimal);
module.component('actionFieldMultiselect', actionFieldMultiselect);
module.component('actionFieldSelect', actionFieldSelect);
module.component('actionFieldString', actionFieldString);
module.component('actionFieldText', actionFieldText);
module.component('helpicon', react2angular(HelpIcon, ['helpText']));
module.component('fieldLabel', react2angular(FieldLabel, ['field']));
module.component(
  'reactSelect',
  react2angular(ReactSelect, ['field', 'model', 'form']),
);

export const $injector = angular.bootstrap(document, [module.name], {
  strictDi: true,
});
