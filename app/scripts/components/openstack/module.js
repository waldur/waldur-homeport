import openstackFlavorList from './openstack-flavor-list';
import openstackTemplateList from './openstack-template-list';
import fieldsConfig from './fields-config';

export default module => {
  module.directive('openstackFlavorList', openstackFlavorList);
  module.directive('openstackTemplateList', openstackTemplateList);
  module.config(fieldsConfig);
}
