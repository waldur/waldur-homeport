import resourcePrivateCloudsList from './resource-private-clouds-list';
import resourceVmsList from './resource-vms-list';
import BaseProjectResourcesTabController from './resources-base-list';
import baseResourceListController from './resources-list';

export default module => {
  module.service('baseResourceListController', baseResourceListController);
  module.service(
    'BaseProjectResourcesTabController',
    BaseProjectResourcesTabController,
  );
  module.component('resourceVmsList', resourceVmsList);
  module.component('resourcePrivateCloudsList', resourcePrivateCloudsList);
};
