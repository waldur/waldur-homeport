import baseResourceListController from './resources-list';
import BaseProjectResourcesTabController from './resources-base-list';
import resourceStorageTabs from './resource-storage-tabs';
import resourceVmsList from './resource-vms-list';
import resourcePrivateCloudsList from './resource-private-clouds-list';

export default module => {
  module.service('baseResourceListController', baseResourceListController);
  module.service('BaseProjectResourcesTabController', BaseProjectResourcesTabController);
  module.component('resourceStorageTabs', resourceStorageTabs);
  module.component('resourceVmsList', resourceVmsList);
  module.component('resourcePrivateCloudsList', resourcePrivateCloudsList);
};
