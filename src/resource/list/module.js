import resourcePrivateCloudsList from './resource-private-clouds-list';
import resourceStorageTabs from './resource-storage-tabs';
import resourceVmsList from './resource-vms-list';
import resourceVolumesList from './resource-volumes-list';
import BaseProjectResourcesTabController from './resources-base-list';
import baseResourceListController from './resources-list';

export default module => {
  module.service('baseResourceListController', baseResourceListController);
  module.service(
    'BaseProjectResourcesTabController',
    BaseProjectResourcesTabController,
  );
  module.component('resourceStorageTabs', resourceStorageTabs);
  module.component('resourceVmsList', resourceVmsList);
  module.component('resourcePrivateCloudsList', resourcePrivateCloudsList);
  module.component('resourceVolumesList', resourceVolumesList);
};
