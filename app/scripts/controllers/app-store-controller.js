(function() {
  angular.module('ncsaas')
    .controller('AppStoreController', [
      'baseControllerAddClass', 'resourcesService', 'projectsService', 'projectCloudMembershipsService',
      'templatesService', 'servicesService', AppStoreController]);

  function AppStoreController(
    baseControllerAddClass, resourcesService, projectsService, projectCloudMembershipsService, templatesService,
    servicesService) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      showServices: false,
      showOptions: false,
      showTemplates: false,
      showKeys: false,

      serviceList: [],
      flavorList: [],
      projectList: [],
      templateList:[],
      selectedProject: null,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(this));
        this._super();
        this.listState = 'resources.list';
      },
      activate:function() {
        var vm = this;
        // projects
        projectsService.getList().then(function(response) {
          vm.projectList = response;
        });
      },
      setProject:function(project) {
        var vm = this;
        if (project) {
          vm.instance.project = project.url;
          vm.showServices = true;
          // projectCloudMemberships
          projectCloudMembershipsService.getList({project: project.uuid}).then(function(response) {
            vm.serviceList = response;
          });
        } else {
          vm.serviceList = {};
        }
        vm.showFlavors = false;
        vm.showOptions = false;
      },
      setService:function(projectCloudMemberships) {
        var vm = this;
        servicesService.$get(projectCloudMemberships.cloud_uuid).then(function(response) {
          var service = response;
          vm.flavorList = service.flavors;
          templatesService.getList({cloud: service.uuid}).then(function(response) {
            vm.templateList = response;
          });
          vm.selectedService = projectCloudMemberships;
          vm.showFlavors = true;
          vm.showOptions = false;
        });
      },
      setFlavor:function(flavor) {
        var vm = this;
        vm.instance.flavor = flavor.url;
        vm.selectedFlavor = flavor;
        vm.showOptions = true;
      },
      currentCustomerUpdatedHandler:function() {
        var vm = this.controllerScope;
        vm.showFlavors = false;
        vm.showOptions = false;
        vm.selectedProject = null;
        vm.serviceList = [];
        vm.projectList = [];
        vm.templateList = [];
        vm.flavorList = [];
        vm.activate();
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
