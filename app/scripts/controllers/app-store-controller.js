(function() {
  angular.module('ncsaas')
    .controller('AppStoreController', [
      'baseControllerAddClass', 'servicesService', 'currentStateService', AppStoreController]);

  function AppStoreController(baseControllerAddClass, servicesService, currentStateService) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      UNIQUE_FIELDS: {
        service_project_link: 'service_project_link',
        ssh_public_key: 'ssh_public_key',
        configuration: 'configuration'
      },
      FIELD_TYPES: {
        string: 'string',
        field: 'field'
      },

      secondStep: true,
      thirdStep: false,

      activeTab: null,

      successMessage: 'Purchase of {vm_name} was successful.',

      formOptions: {},

      init:function() {
        this.service = servicesService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentProjectUpdated', this.setCurrentProject.bind(controllerScope));
        this._super();
        this.listState = 'resources.list';
      },
      activate:function() {
        var vm = this;
        servicesService.getServicesList().then(function(response) {
          vm.servicesList = response;
        });
      },
      setService:function(service) {
        var vm = this;
        vm.selectedService = service;
        vm.thirdStep = true;
        if (service.resources.Droplet) {
          vm.instance = servicesService.$create(service.resources.Droplet);
          vm.setCurrentProject();
          servicesService.getOption(service.resources.Droplet).then(function(response) {
            vm.setFormOptions(response.actions.POST);
          });
        } else {
          vm.formOptions = {};
        }
      },
      setFormOptions: function(formOptions) {
        for (name in formOptions) {
          if (!formOptions[name].read_only && name != this.UNIQUE_FIELDS.service_project_link) {
            this.formOptions[formOptions[name].type] = this.formOptions[formOptions[name].type] || {};
            if (name == this.UNIQUE_FIELDS[name]) {
              this.formOptions[name] = formOptions[name];
            } else {
              if (!this.activeTab && formOptions[name].type == this.FIELD_TYPES.field) {
                this.activeTab = name;
              }
              this.formOptions[formOptions[name].type][name] = formOptions[name];
            }
          }
        }
      },
      doChoice: function(name, choice) {
        this.instance[name] = choice.value;
      },
      setCurrentProject: function() {
        var vm = this;
        currentStateService.getProject().then(function(response) {
          vm.instance[vm.UNIQUE_FIELDS.service_project_link] = response.url;
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
