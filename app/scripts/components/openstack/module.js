import openstackTenantTemplateField from './openstack-tenant-template-field';
import openstackTenantTemplateDialog from './openstack-tenant-template-dialog';
import fieldsConfig from './fields-config';

export default module => {
  module.directive('openstackTenantTemplateField', openstackTenantTemplateField);
  module.directive('openstackTenantTemplateDialog', openstackTenantTemplateDialog);
  module.config(fieldsConfig);
}
