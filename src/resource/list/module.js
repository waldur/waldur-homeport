import baseResourceListController from './resources-list';
import BaseProjectResourcesTabController from './resources-base-list';
import resourceStorageTabs from './resource-storage-tabs';
import resourceVmsList from './resource-vms-list';
import resourcePrivateCloudsList from './resource-private-clouds-list';
import resourceVolumesList from './resource-volumes-list';
import resourceGlobalList from './resource-global-list';
import resourceGlobalListFiltered from './resource-global-list-filtered';

export default module => {
  module.service('baseResourceListController', baseResourceListController);
  module.service('BaseProjectResourcesTabController', BaseProjectResourcesTabController);
  module.component('resourceStorageTabs', resourceStorageTabs);
  module.component('resourceVmsList', resourceVmsList);
  module.component('resourcePrivateCloudsList', resourcePrivateCloudsList);
  module.component('resourceVolumesList', resourceVolumesList);
  module.component('resourceGlobalList', resourceGlobalList);
  module.component('resourceGlobalListFiltered', resourceGlobalListFiltered);
};
