import template from './appstore-store.html';

const appstoreStore = {
  template,
  controller: AppStoreController,
  controllerAs: 'AppStore',
};

export default appstoreStore;

// @ngInject
function AppStoreController(
  baseControllerAddClass,
  servicesService,
  currentStateService,
  usersService,
  ENV,
  ncUtils,
  $q,
  $injector,
  $state,
  resourcesService,
  joinService,
  ncUtilsFlash,
  projectsService,
  priceEstimationService,
  ncServiceUtils,
  resourceUtils,
  coreUtils,
  CategoriesService,
  AppstoreFieldConfiguration,
  AppstoreResourceLoader,
  AppstoreProvidersService,
  AppStoreUtilsService,
  BreadcrumbsService,
  ResourceProvisionPolicy) {
  let controllerScope = this;
  let Controller = baseControllerAddClass.extend({
    enablePurchaseCostDisplay: ENV.enablePurchaseCostDisplay,

    secondStep: false,
    resourceTypesBlock: false,
    loadingResourceProperties: false,

    successMessage: gettext('Purchase of {vm_name} was successful.'),
    formOptions: {},
    allFormOptions: {},
    selectedService: {},
    serviceType: null,
    selectedCategory: {},
    selectedResourceType: null,
    currentCustomer: {},
    currentProject: {},
    services: {},
    renderStore: false,
    loadingProviders: true,
    categoryServices: {},

    configureStepNumber: 4,
    fields: [],

    init:function() {
      this.service = resourcesService;
      this.controllerScope = controllerScope;
      this._super();
    },
    activate:function() {
      this.loading = true;
      $q.all([
        usersService.getCurrentUser().then(user =>
          this.currentUser = user),
        currentStateService.getCustomer().then(customer =>
          this.currentCustomer = customer),
        servicesService.getServicesList().then(servicesMetadata =>
          this.servicesMetadata = servicesMetadata)
      ])
      .then(() => this.setCurrentProject())
      .then(() => this.refreshBreadcrumbs())
      .finally(() => this.loading = false);
    },
    refreshBreadcrumbs: function() {
      BreadcrumbsService.items = [
        {
          label: gettext('Project workspace'),
          state: 'project.details',
          params: {
            uuid: this.currentProject.uuid
          }
        },
        {
          label: gettext('Service store'),
          action: () => AppStoreUtilsService.openDialog(),
        }
      ];
      if (this.selectedCategory) {
        BreadcrumbsService.activeItem = this.selectedCategory.name;
      }
    },
    setCategory: function(category) {
      if (category === this.selectedCategory) {
        return;
      }

      const { disabled, errorMessage } = ResourceProvisionPolicy.checkResource(
        this.currentUser, this.currentCustomer, this.currentProject, category.key
      );
      if (disabled) {
        this.policyErrorMessage = errorMessage;
        return;
      }

      this.selectedCategory = category;
      this.secondStep = true;
      this.serviceMetadata = {};
      this.serviceType = null;
      this.resourceTypesBlock = false;
      this.selectedResourceType = null;
      this.selectedResourceTypeName = null;
      this.selectedService = null;
      this.fields = [];

      let services = this.getServices();
      this.renderStore = services && services.length > 0;

      if (services && services.length === 1) {
        this.setService(services[0]);
      }

      this.refreshBreadcrumbs();
    },
    getServices: function() {
      if (this.selectedCategory) {
        return this.categoryServices[this.selectedCategory.name];
      }
    },
    setService: function(service) {
      if (!service.enabled) {
        return;
      }
      this.selectedService = service;
      this.serviceType = this.selectedService.type;
      this.serviceMetadata = this.servicesMetadata[this.serviceType];
      this.fields = [];
      this.selectedResourceType = null;

      if (this.serviceMetadata) {
        let types = this.getResourceTypes(this.selectedCategory.key, this.serviceType);
        if (types.length === 1) {
          this.setResourceType(types[0]);
          this.resourceTypesBlock = false;
          this.configureStepNumber = 3;
        } else {
          this.resourceTypesBlock = true;
          this.configureStepNumber = 4;
        }
      }
    },
    getResourceTypes: function(category, serviceType) {
      let types = ENV.resourceCategory;
      let blacklisted = ['OpenStackTenant.Snapshot'];
      return Object.keys(types).filter(function(resource) {
        return types[resource] === category &&
               resource.split('.')[0] === serviceType &&
               blacklisted.indexOf(resource) === -1;
      }).map(function(resource) {
        return resource.split('.')[1];
      });
    },
    resetResourceType: function() {
      let vm = this;
      vm.selectedResourceType = null;
      vm.selectedResourceTypeName = null;
      vm.fields = [];
      vm.instance = null;
      vm.allFormOptions = null;
    },
    setResourceType: function(type) {
      this.selectedResourceType = type;
      this.errors = {};
      this.selectedResourceTypeName = type.split(/(?=[A-Z])/).join(' ');
      this.fields = [];

      this.loadingResourceProperties = true;
      return servicesService.getOption(this.getResourceUrl()).then(response => {
        let key = this.serviceType + '.' + this.selectedResourceType;
        let fields = angular.copy(AppstoreFieldConfiguration[key]);
        if (!fields) {
          fields = {
            order: Object.keys(response.actions.POST).filter(key => key !== 'service_project_link'),
            options: response.actions.POST
          };
        } else {
          fields.order = fields.order.filter(name => {
            const field = fields.options[name];
            return !field || !field.is_visible || field.is_visible(ENV);
          });
        }
        let formOptions = angular.merge({}, response.actions.POST, fields.options);
        delete formOptions.project;
        delete formOptions.service_settings;
        this.fields = fields;

        this.allFormOptions = formOptions;
        return AppstoreResourceLoader
          .loadValidChoices(this.getContext(), formOptions)
          .then(validChoices => angular.forEach(validChoices, (choices, name) => {
            if (this.fields.options.hasOwnProperty(name)) {
              this.fields.options[name].choices = choices;
            }
          }));
      }).finally(() => {
        this.instance = this.getInstance();
        this.loadingResourceProperties = false;
      });
    },
    getInstance: function() {
      return {
        customer: this.currentCustomer,
        project: this.currentProject,
        service: this.selectedService,
        service_project_link: this.selectedService.service_project_link_url
      };
    },
    getContext: function() {
      return {
        project: this.currentProject.uuid,
        project_uuid: this.currentProject.uuid,
        service_uuid: this.selectedService.uuid,
        settings_uuid: this.selectedService.settings_uuid,
        service_settings_uuid: this.selectedService.settings_uuid,
      };
    },
    getServiceTypeDisplay: ncServiceUtils.getTypeDisplay,
    formatResourceType: resourceUtils.formatResourceType,
    setCurrentProject: function() {
      let vm = this;
      let categories = CategoriesService.getResourceCategories();
      vm.categories = [];
      vm.selectedCategory = null;
      vm.secondStep = false;
      vm.serviceMetadata = {};
      vm.serviceType = null;
      vm.resourceTypesBlock = false;
      vm.fields = [];
      vm.selectedResourceType = null;
      vm.instance = null;
      vm.renderStore = false;
      vm.loadingProviders = true;

      return currentStateService.getProject().then(function(project) {
        vm.currentProject = project;
        return AppstoreProvidersService.loadServices(project).then(function() {
          for (let j = 0; j < categories.length; j++) {
            let category = categories[j];
            vm.categoryServices[category.name] = [];
            for (let i = 0; i < vm.currentProject.services.length; i++) {
              let service = vm.currentProject.services[i];
              if (category.services && (category.services.indexOf(service.type) + 1)) {
                vm.categoryServices[category.name].push(service);
              }
            }
            if (vm.categoryServices[category.name].length > 0) {
              vm.categories.push(category);
            }
            vm.categoryServices[category.name].sort(function(a, b) {
              return a.enabled < b.enabled;
            });
          }
          vm.setCategoryFromParams();
        });
      }).finally(function() {
        vm.loadingProviders = false;
      });
    },
    setCategoryFromParams: function() {
      let vm = this;
      let key = $state.$current.data.category;
      if (key) {
        for (let i = 0; i < vm.categories.length; i++) {
          let category = vm.categories[i];
          if (category.key === key) {
            vm.setCategory(category);
            return;
          }
        }
      }
    },
    canSave: function() {
      if (!this.instance) {
        return false;
      }
      for (let name in this.allFormOptions) {
        if (this.allFormOptions[name].required && (!this.instance[name] && this.instance[name] !== 0)) {
          return false;
        }
      }
      return true;
    },
    getTooltip: function() {
      if (!this.instance) {
        return gettext('Instance is not configured.');
      }
      let fields = [];
      for (let name in this.allFormOptions) {
        let options = this.allFormOptions[name];
        if (options.required && !this.instance[name]) {
          fields.push(options.label);
        }
      }
      if (fields.length > 0) {
        return coreUtils.templateFormatter(gettext('Please specify {fields}.'), {
          fields: fields.join(', ').toLowerCase()
        });
      }
    },
    getResourceUrl: function() {
      if (this.selectedResourceType === 'Tenant') {
        return ENV.apiEndpoint + 'api/openstack-packages/';
      }
      return this.serviceMetadata.resources[this.selectedResourceType];
    },
    save: function() {
      let callback = this._super.bind(this);

      if (!this.canSave()) {
        return $q.reject();
      } else if (this.fields.hasOwnProperty('saveConfirmation')) {
        return this.fields.saveConfirmation($q, this.instance).then(() => {
          // _super is getting lost in clojures.
          return callback();
        }).catch(()=> {
          return $q.reject();
        });
      }

      return callback();
    },
    saveInstance: function() {
      let resourceUrl = this.getResourceUrl();
      let instance = servicesService.$create(resourceUrl);
      instance.service_project_link = this.selectedService.service_project_link_url;

      for (let name in this.allFormOptions) {
        if (this.instance.hasOwnProperty(name)) {
          let value = this.instance[name];
          let option = this.allFormOptions[name];
          if (value && value.hasOwnProperty('url')) {
            value = value.url;
          }
          if (option.serializer) {
            value = option.serializer(value, option);
          }
          instance[name] = value;
        }
      }
      return instance.$save();
    },
    afterSave: function() {
      this._super();
      projectsService.clearAllCacheForCurrentEndpoint();
      priceEstimationService.clearAllCacheForCurrentEndpoint();
      joinService.clearAllCacheForCurrentEndpoint();
      if (this.fields.onSuccess) {
        this.fields.onSuccess($injector);
      }
    },
    onError: function() {
      let message = '';
      if (angular.isObject(this.errors)) {
        for (let name in this.errors) {
          if (this.allFormOptions[name]) {
            message += this.allFormOptions[name].label + ': ' + this.errors[name] + '<br/>';
          } else {
            message += name + ': ' + this.errors[name] + '<br/>';
          }
        }
      } else {
        message = gettext('Server error occurred.');
      }
      ncUtilsFlash.error(message);
    },
    successRedirect: function(model) {
      if (this.selectedResourceType === 'Tenant') {
        $state.go('resources.details', {
          uuid: ncUtils.getUUID(model.tenant),
          resource_type: 'OpenStack.Tenant'
        });
      } else {
        $state.go('resources.details', {uuid: model.uuid, resource_type: model.resource_type});
      }
    }
  });

  controllerScope.__proto__ = new Controller();
}
