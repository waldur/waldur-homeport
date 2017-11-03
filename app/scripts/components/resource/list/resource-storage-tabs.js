import template from './resource-storage-tabs.html';

const resourceStorageTabs = {
  template,
  controller: class StorageTabController {
    // @ngInject
    constructor($scope, resourcesService, currentStateService) {
      this.$scope = $scope;
      this.resourcesService = resourcesService;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.currentStateService.getProject().then(project => {
        this.currentProject = project;
        this.$scope.$on('refreshCounts', this.refreshCount.bind(this));
        this.loading = true;
        return this.refreshCount().then(() => this.loading = false);
      });
    }

    onVolumesListReceive({ filter, response }) {
      if (!filter.name) {
        this.volumesCount = response.resultCount;
      }
    }

    onSnapshotsListReceive({ filter, response }) {
      if (!filter.name) {
        this.snapshotsCount = response.resultCount;
      }
    }

    refreshCount() {
      const query = {
        resource_category: 'storages',
        project: this.currentProject.uuid,
      };
      this.resourcesService.cleanAllCache();
      return this.resourcesService.countByType(query).then(counts => {
        this.volumesCount = counts['OpenStackTenant.Volume'];
        this.snapshotsCount = counts['OpenStackTenant.Snapshot'];
      });
    }
  }
};

export default resourceStorageTabs;
