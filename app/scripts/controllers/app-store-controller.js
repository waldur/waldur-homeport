(function() {
  angular.module('ncsaas')
    .service('AppStoreUtilsService', AppStoreUtilsService);

  AppStoreUtilsService.$inject = ['$uibModal', 'ENV'];
  function AppStoreUtilsService($uibModal, ENV) {
    this.openDialog = openDialog;
    this.findOffering = findOffering;

    function openDialog(options) {
      $uibModal.open({
        component: 'appstoreCategorySelector',
        size: 'lg',
        resolve: {
          selectProject: function() {
            return options && options.selectProject;
          }
        }
      });
    }
    function findOffering(key) {
      var offerings = ENV.offerings;
      for (var i = 0; i < offerings.length; i++) {
        if (offerings[i].key === key) {
          return offerings[i];
        }
      }
    }
  }


  angular.module('ncsaas')
    .controller('AppStoreOfferingController', AppStoreOfferingController);

  AppStoreOfferingController.$inject = [
    '$stateParams', '$state', 'issuesService', 'AppStoreUtilsService', 'ncUtilsFlash'
  ];
  function AppStoreOfferingController(
    $stateParams, $state, issuesService, AppStoreUtilsService, ncUtilsFlash) {
    var vm = this;
    activate();
    vm.save = save;

    function activate() {
      vm.offering = AppStoreUtilsService.findOffering($stateParams.category);
      if (!vm.offering) {
        $state.go('errorPage.notFound')
      }
    }

    function save() {
      return issuesService.createIssue({
        summary: 'Please create a turnkey solution: ' + vm.offering.label,
        description: vm.details
      }).then(function() {
        $state.go('support.list');
      }, function(error) {
        ncUtilsFlash.error('Unable to create request for a turnkey solution.');
      });
    }
  }

  angular.module('ncsaas')
    .controller('AppStoreHeaderController', AppStoreHeaderController);

  AppStoreHeaderController.$inject = ['$scope', '$stateParams', 'AppStoreUtilsService']
  function AppStoreHeaderController($scope, $stateParams, AppStoreUtilsService) {
    $scope.openDialog = AppStoreUtilsService.openDialog;
    refreshCategory();
    $scope.$on('$stateChangeSuccess', refreshCategory);
    function refreshCategory() {
      if ($stateParams.category) {
        $scope.category = AppStoreUtilsService.findOffering($stateParams.category);
      }
    }
  }


  angular.module('ncsaas')
    .controller('AppStoreController', [
      'baseControllerAddClass',
      'servicesService',
      'currentStateService',
      'ENV',
      'defaultPriceListItemsService',
      'ncUtils',
      '$q',
      '$state',
      '$stateParams',
      '$rootScope',
      'premiumSupportPlansService',
      'premiumSupportContractsService',
      'resourcesService',
      'resourcesCountService',
      'joinService',
      'ncUtilsFlash',
      'projectsService',
      'priceEstimationService',
      '$document',
      '$scope',
      '$filter',
      'ncServiceUtils',
      'resourceUtils',
      AppStoreController]);

  function AppStoreController(
    baseControllerAddClass,
    servicesService,
    currentStateService,
    ENV,
    defaultPriceListItemsService,
    ncUtils,
    $q,
    $state,
    $stateParams,
    $rootScope,
    premiumSupportPlansService,
    premiumSupportContractsService,
    resourcesService,
    resourcesCountService,
    joinService,
    ncUtilsFlash,
    projectsService,
    priceEstimationService,
    $document,
    $scope,
    $filter,
    ncServiceUtils,
    resourceUtils) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      UNIQUE_FIELDS: {
        service_project_link: 'service_project_link',
      },
      FIELD_TYPES: {
        string: 'string',
        field: 'field',
        integer: 'integer'
      },

      currency: ENV.currency,
      enablePurchaseCostDisplay: ENV.enablePurchaseCostDisplay,
      VmProviderSettingsUuid: ENV.VmProviderSettingsUuid,
      gitLabProviderSettingsUuid: ENV.gitLabProviderSettingsUuid,

      secondStep: false,
      resourceTypesBlock: false,

      successMessage: 'Purchase of {vm_name} was successful.',
      formOptions: {},
      allFormOptions: {},
      selectedService: {},
      serviceType: null,
      selectedCategory: {},
      selectedResourceType: null,
      currentCustomer: {},
      currentProject: {},
      showCompare: ENV.showCompare,
      providers: [],
      services: {},
      renderStore: false,
      loadingProviders: true,
      categoryServices: {},

      configureStepNumber: 4,
      selectedPackageName: null,
      agreementShow: false,
      chooseResourceTypeStepNumber: 3,

      // cart
      total: 0,
      defaultPriceListItems: [],
      priceItems: [],

      fields: [],
      fieldsOrder: null,

      quotaThreshold: 0.8,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
      },
      modalInit: function(field) {
        var vm = this;
        field.showChoices = true;
        $document.bind('keydown', function(e) {
          if (e.which === 27) {
            vm.closeModal(field);
          }
        });
      },
      closeModal: function(field) {
        field.showChoices = false;
        $document.unbind('keypress');
      },
      activate:function() {
        var vm = this;
        servicesService.getServicesList().then(function(response) {
          vm.servicesMetadata = response;
          vm.setCurrentProject();
        });
        currentStateService.getCustomer().then(function(response) {
          vm.currentCustomer = response;
        });
      },
      setCategory: function(category) {
        if (category === this.selectedCategory) {
          return;
        }

        if (category.requireStaffOwnerManager && !currentStateService.getStaffOwnerManager()) {
          $state.go('errorPage.notFound');
          return;
        }

        this.selectedCategory = category;
        this.secondStep = true;
        this.serviceMetadata = {};
        this.serviceType = null;
        this.selectedPackage = {};
        this.agreementShow = false;
        this.resourceTypesBlock = false;
        this.selectedResourceType = null;
        this.selectedResourceTypeName = null;
        this.selectedService = null;
        this.fields = [];
        this.resetPriceItems();

        var services = this.categoryServices[this.selectedCategory.name];

        this.renderStore = (services && services.length > 0) ||
                           (category.packages && category.packages.length > 0);

        if (ENV.VmProviderSettingsUuid && this.isVirtualMachinesSelected()) {
          for (var i = 0; i < services.length; i++) {
            if (services[i].settings_uuid == ENV.VmProviderSettingsUuid) {
              this.setService(services[i]);
              this.configureStepNumber = 2;
              this.secondStep = false;
              break;
            }
          }
        } else if (ENV.gitLabProviderSettingsUuid && this.isApplicationSelected()) {
          for (var i = 0; i < services.length; i++) {
            if (services[i].settings_uuid == ENV.gitLabProviderSettingsUuid) {
              this.setService(services[i]);
              this.chooseResourceTypeStepNumber = 2;
              this.configureStepNumber = 3;
              this.secondStep = false;
              break;
            }
          }
        } else if (services && services.length == 1) {
          this.setService(services[0]);
        }
      },
      isVirtualMachinesSelected: function() {
        return this.selectedCategory.name == ENV.appStoreCategories[ENV.VirtualMachines].name;
      },
      isApplicationSelected: function() {
        return this.selectedCategory.name == ENV.appStoreCategories[ENV.Applications].name;
      },
      isSupportSelected: function() {
        return this.selectedCategory.name == 'Support';
      },
      setService: function(service) {
        if (!service.enabled) {
          return;
        }
        this.resetPriceItems();
        this.selectedService = service;
        this.serviceType = this.selectedService.type;
        this.serviceMetadata = this.servicesMetadata[this.serviceType];
        this.fields = [];
        this.selectedResourceType = null;

        if (this.serviceMetadata) {
          var types = Object.keys(this.serviceMetadata.resources);
          var filteredTypes = types.filter(this.filterResources.bind(this));
          if (filteredTypes.length === 1) {
            this.setResourceType(filteredTypes[0]);
            this.resourceTypesBlock = false;
            this.configureStepNumber = 3;
          } else {
            this.resourceTypesBlock = true;
            this.configureStepNumber = 4;
          }
        }
      },
      filterResources: function(item) {
        if (this.selectedCategory.name === 'Virtual machines') {
          if (this.serviceType === 'OpenStackTenant' && item != 'Instance') {
            return false;
          }
        } else if (this.selectedCategory.name === 'Private clouds') {
          return item === 'Tenant';
        } else if (this.selectedCategory.name === 'Storages') {
          return item === 'Volume';
        }
        return true;
      },
      setResourceType: function(type) {
        var vm = this;
        vm.selectedResourceType = type;
        vm.errors = {};
        vm.choiceDisplay = {};
        vm.selectedResourceTypeName = type.split(/(?=[A-Z])/).join(" ");
        vm.fields = [];
        var resourceUrl = vm.getResourceUrl();
        if (resourceUrl) {
          vm.instance = servicesService.$create(resourceUrl);
          vm.instance.service_project_link = vm.selectedService.service_project_link_url;

          var promise = servicesService.getOption(resourceUrl).then(function(response) {
            var formOptions = response.actions.POST;
            vm.allFormOptions = formOptions;
            return vm.getValidChoices(formOptions).then(function(validChoices) {
              vm.setFields(formOptions, validChoices);
            });
          });
          ncUtils.blockElement('resource-properties', promise);
        }
      },
      getValidChoices: function(formOptions) {
        var vm = this;
        var promises = [];
        var validChoices = {};
        var context = {
          project: vm.currentProject.uuid,
          project_uuid: vm.currentProject.uuid,
          service_uuid: vm.selectedService.uuid,
          settings_uuid: vm.selectedService.settings_uuid,
          service_settings_uuid: vm.selectedService.settings_uuid,
        };

        angular.forEach(formOptions, function(options, name) {
          if (options.url && name != 'service_project_link') {
            var parts = options.url.split("?");
            if (parts.length > 1) {
              var base_url = parts[0];
              var query = ncUtils.parseQueryString(parts[1])
            } else {
              var base_url = options.url;
              var query = {};
            }
            var query = angular.extend(query, context);

            var promise = servicesService.getAll(query, base_url).then(function(response) {
              validChoices[name] = vm.formatChoices(response, options, name);
            });
            promises.push(promise);
          }
        });
        return $q.all(promises).then(function() {
          return validChoices;
        });
      },
      formatChoices: function(items, options, name) {
        var vm = this;
        return items.map(function(item) {
          return {
            value: item[options.value_field] || item.url,
            display_name: vm.formatDisplayName(item, options, name),
            item: item
          }
        });
      },
      formatDisplayName: function(item, options, name) {
        if (name == 'image' && this.selectedService.type == 'DigitalOcean') {
          if (item.is_official) {
            return item.name + ' distribution';
          } else {
            return item.name + ' snapshot created at ' + $filter('dateTime')(item.created_at);
          }
        } else {
          return item[options.display_name_field] || item.name;
        }
      },
      setFields: function(formOptions, validChoices) {
        this.fields = [];
        for (var name in formOptions) {
          var options = formOptions[name];
          if (name === this.UNIQUE_FIELDS.service_project_link) {
            continue;
          }

          var type = options.type;
          if (type === 'field' || type === 'select') {
            type = 'choice';
          }

          var choices = validChoices[name] || options.choices;

          if (name === 'user_data') {
            type = 'text';
          }

          var icons = {
            size: 'gear',
            flavor: 'gear',
            ssh_public_key: 'key',
            security_groups: 'lock',
            group: 'group'
          };
          var icon = icons[name] || 'cloud';
          var label = options.label;
          var required = options.required;
          var help_text = options.help_text;
          var min, max, units;

          if (name === 'system_volume_size' || name === 'size') {
            min = 0;
            max = 320;
            units = 'GB';
            help_text = null;
          }

          if (name === 'data_volume_size') {
            min = 1;
            max = 320;
            units = 'GB';
            required = true;
            help_text = null;
          }
          var display_label;
          if (name === 'username') {
            display_label = this.selectedService.type + ' OS username';
          }
          if (name === 'password') {
            display_label = this.selectedService.type + ' OS password';
          }
          if (name === 'name') {
            if (this.selectedCategory.name === 'Virtual machines') {
              display_label = 'VM name';
            }
            if (this.selectedCategory.name === 'Applications') {
              display_label = 'Name'
            }
          }

          var item_type = name;
          if (name === 'size') {
            item_type = 'flavor';
          }

          this.fields.push({
            name: name,
            label: display_label ? display_label : label,
            type: type,
            help_text: help_text,
            required: required,
            choices: choices,
            icon: icon,
            min: min,
            max: max,
            units: units,
            options: options,
            item_type: item_type
          });
          display_label = null;
        }
        this.fieldsOrder = [
          'name', 'region', 'image', 'size', 'flavor', 'system_volume_size', 'data_volume_size',
          'security_groups', 'ssh_public_key', 'tenant', 'floating_ip', 'skip_external_ip_assignment',
          'availability_zone', 'description', 'user_data', 'user_username'
        ];
        this.fields.sort(this.fieldsComparator.bind(this));
        this.sortFlavors();
        this.attachIconsToImages();
      },
      fieldsComparator: function(a, b) {
        var i = this.fieldsOrder.indexOf(a.name);
        var j = this.fieldsOrder.indexOf(b.name);
        if (i === j) {
          return 0;
        } else if (i === -1) {
          return 1;
        } else if (j === -1) {
          return -1;
        } else {
          return i - j;
        }
      },
      cartComparator: function(a, b) {
        return this.fieldsOrder.indexOf(a.type) - this.fieldsOrder.indexOf(b.type);
      },
      attachIconsToImages: function() {
        var field = this.findFieldByName('image');
        if (!field) {
          return;
        }
        for (var i = 0; i < field.choices.length; i++) {
          var choice = field.choices[i];
          if (choice.display_name.indexOf('Visual Studio') != -1) {
            choice.icon = 'visual-studio';
          }
          else if (choice.display_name.indexOf('CentOS') != -1) {
            choice.icon = 'centos';
          }
          else if (choice.display_name.indexOf('Windows') != -1) {
            choice.icon = 'windows';
          }
          else if (choice.display_name.indexOf('Ubuntu') != -1) {
            choice.icon = 'ubuntu';
          }
        }
      },
      getServiceTypeDisplay: ncServiceUtils.getTypeDisplay,
      getServiceIcon: ncServiceUtils.getServiceIcon,
      formatResourceType: resourceUtils.formatResourceType,
      serviceClass: function(service) {
        return {
          state: this.selectedService === service,
          disabled: !service.enabled,
          warning: !!service.warning,
          provider: this.selectedCategory.type === 'provider'
        };
      },
      choiceDisplay: {},
      resetChoice: function(field) {
        this.instance[field.name] = undefined;
        this.instance[field.name + '_item'] = undefined;
        this.choiceDisplay[field.name] = undefined;
        this.updateDependentFields(field.name);
        this.deletePriceItem(field.name);
        this.closeModal(field);
      },
      doChoice: function(field, choice) {
        var vm = this, name = field.name;
        this.choiceDisplay[name] = choice.display_name;
        if (name == 'security_groups') {
          if (this.instance[name] === undefined) {
            this.instance[name] = [];
          }
          if (this.instance[name].indexOf(choice.value) === -1) {
            this.instance[name].push(choice.value);
          } else {
            this.instance[name].splice(this.instance[name].indexOf(choice.value), 1);
          }
          var parts = [];
          for (var i = 0; i < field.choices.length; i++) {
            var c = field.choices[i];
            if (this.instance[name].indexOf(c.value) !== -1) {
              parts.push(c.display_name);
            }
          }
          this.choiceDisplay[name] = parts.join(', ');
        } else if (name === 'ssh_public_key') {
          this.instance[name] = choice.value;
          this.instance[name + '_item'] = choice;
        } else if (name === 'group') {
          this.instance[name] = choice.value;
        } else {
          this.instance[name] = choice.value;
          this.instance[name + '_item'] = choice.item;
        }
        this.updateDependentFields(name);
        if (ENV.nonChargeableAppStoreOptions.indexOf(name) !== -1) {
          return;
        }
        defaultPriceListItemsService.getAll({
          resource_type: vm.serviceType + '.' + vm.selectedResourceType
        }).then(function(response) {
          vm.defaultPriceListItems = response;
          vm.setPriceItem(field.item_type, choice.display_name, choice);
        });
      },
      updateDependentFields: function(name) {
        if (name == 'region') {
          this.filterSizeByRegion();
          this.filterImageByRegion();
        }
        if (name == 'image') {
          this.updateFlavors();
        }
        if (name == 'flavor') {
          this.setSize();
        }
      },
      isChosen: function(name, choice) {
        var value = choice.value;
        value = (name == 'group') ? this.instance[name] : value;
        if (value == undefined) {
          return false;
        }
        if (name == 'group' && this.instance[name]) {
          return choice.value === this.instance[name];
        }
        if (name == 'security_groups') {
          var vals = this.instance[name];
          if (!vals) {
            return false;
          }
          return vals.indexOf(value) > -1;
        } else {
          return this.instance[name] == value;
        }
      },
      filterSizeByRegion: function() {
        var field = this.findFieldByName('size');
        if (!field) {
          return;
        }

        var region = this.instance.region;
        for (var i = 0; i < field.choices.length; i++) {
          var choice = field.choices[i];
          var found = false;
          for (var j = 0; j < choice.item.regions.length; j++) {
            var choice_region = choice.item.regions[j];
            if (choice_region.url == region) {
              found = true;
              break;
            }
          }
          choice.disabled = !found;
        }
        var choice = this.getChoiceByValue(field.choices, this.instance.size);
        if (choice && choice.disabled) {
          this.instance.size = null;
          this.choiceDisplay['size'] = null;
          this.deletePriceItem('size');
        }
        this.sortSizes();
      },
      filterImageByRegion: function() {
        var field = this.findFieldByName('image');
        if (!field) {
          return;
        }

        var region = this.instance.region;
        for (var i = 0; i < field.choices.length; i++) {
          var choice = field.choices[i];
          var found = false;
          var regions = choice.item.regions || [choice.item.region];
          for (var j = 0; j < regions.length; j++) {
            var choice_region = regions[j];
            if (choice_region.url == region) {
              found = true;
              break;
            }
          }
          choice.disabled = !found;
        }
        var choice = this.getChoiceByValue(field.choices, this.instance.image);
        if (choice && choice.disabled) {
          this.instance.image = null;
          this.choiceDisplay['image'] = null;
          this.deletePriceItem('image');
        }
        this.sortImages();
      },
      setSize: function() {
        var field = this.findFieldByName('system_volume_size');
        if (!field) {
          return;
        }
        if (this.instance.flavor_item) {
          var disk_gb = Math.round(this.instance.flavor_item.disk / 1024);
        } else {
          var disk_gb = 0;
        }
        field.min = disk_gb;
        this.instance.system_volume_size = disk_gb;
        this.instance.system_volume_size_raw = disk_gb;
      },
      updateFlavors: function() {
        var field = this.findFieldByName('flavor');
        if (!field) {
          return;
        }
        var image = this.instance.image_item;
        if (!image) {
          for (var i = 0; i < field.choices.length; i++) {
            var choice = field.choices[i];
            choice.disabled = false;
          }
          return;
        }
        for (var i = 0; i < field.choices.length; i++) {
          var choice = field.choices[i];
          choice.disabled = image.min_ram > choice.item.ram || image.min_disk > choice.item.disk;
        }

        var flavor = this.instance.flavor;
        var choice = this.getChoiceByValue(field.choices, flavor);
        if (choice && choice.disabled) {
          this.instance.flavor = null;
          this.choiceDisplay['flavor'] = null;
          this.deletePriceItem('flavor');
        }

        this.sortFlavors();
      },
      sortSizes: function() {
        var field = this.findFieldByName('size');
        if (!field || !field.choices) {
          return;
        }

        field.choices.sort(function(a, b) {
          if (a.disabled < b.disabled) return -1;
          if (a.disabled > b.disabled) return 1;

          if (a.item.cores > b.item.cores) return 1;
          if (a.item.cores < b.item.cores) return -1;

          if (a.item.ram > b.item.ram) return 1;
          if (a.item.ram < b.item.ram) return -1;

          if (a.item.disk > b.item.disk) return 1;
          if (a.item.disk < b.item.disk) return -1;

          return 0;
        });
      },
      sortImages: function() {
        var field = this.findFieldByName('image');
        if (!field || !field.choices) {
          return;
        }

        field.choices.sort(function(a, b) {
          if (a.disabled < b.disabled) return -1;
          if (a.disabled > b.disabled) return 1;

          if (a.item.name > b.item.name) return 1;
          if (a.item.name < b.item.name) return -1;

          return 0;
        });
      },
      sortFlavors: function() {
        var field = this.findFieldByName('flavor');
        if (!field || !field.choices) {
          return;
        }

        field.choices.sort(function(a, b) {
          if (a.disabled < b.disabled) return -1;
          if (a.disabled > b.disabled) return 1;

          if (a.item.cores > b.item.cores) return 1;
          if (a.item.cores < b.item.cores) return -1;

          if (a.item.ram > b.item.ram) return 1;
          if (a.item.ram < b.item.ram) return -1;

          if (a.item.disk > b.item.disk) return 1;
          if (a.item.disk < b.item.disk) return -1;
          return 0;
        });
      },
      findFieldByName: function(name) {
        for (var i = 0; i < this.fields.length; i++) {
          var field = this.fields[i];
          if (field.name == name) {
            return field;
          }
        }
      },
      getChoiceByValue: function(choices, value) {
        for (var i = 0; i < choices.length; i++) {
          var choice = choices[i];
          if (choice.value == value) {
            return choice;
          }
        }
      },
      setPriceItem: function(item_type, key, choice) {
        this.deletePriceItem(item_type);
        var price = this.findPrice(item_type, key) || choice.item.price || 0;
        this.pushPriceItem(item_type, key, price);
      },
      findPrice: function(item_type, key) {
        for (var i = 0; i < this.defaultPriceListItems.length; i++) {
          var priceItem = this.defaultPriceListItems[i];
          if (priceItem.item_type === item_type && key.indexOf(priceItem.key) !== -1) {
            return priceItem.value;
          }
        }
      },
      pushPriceItem: function(type, name, price) {
        this.priceItems.push({
          type: type,
          name: name,
          price: price
        });
        this.priceItems.sort(this.cartComparator.bind(this));
        this.countTotal();
      },
      deletePriceItem: function(name) {
        var itemTypes = this.priceItems.map(function(item) {
          return item.type;
        });

        var index = itemTypes.indexOf(name);
        if (index + 1) {
          this.priceItems.splice(index, 1);
        }
      },
      resetPriceItems: function() {
        this.priceItems = [];
        this.total = 0;
      },
      countTotal: function() {
        this.total = 0;
        for (var i = 0; i < this.priceItems.length; i++) {
          this.total += this.priceItems[i].price * 1;
        }
      },
      setCurrentProject: function() {
        var vm = this;
        var categories = ENV.appStoreCategories;
        vm.categories = [];
        vm.selectedCategory = null;
        vm.secondStep = false;
        vm.serviceMetadata = {};
        vm.serviceType = null;
        vm.resourceTypesBlock = false;
        vm.fields = [];
        vm.priceItems = [];
        vm.selectedResourceType = null;
        vm.instance = null;
        vm.renderStore = false;
        vm.countTotal();
        vm.loadingProviders = true;

        var projectsPromise = vm.loadProjectWithServices(),
            supportPromise = premiumSupportPlansService.getList(),
          listPromises = $q.all([projectsPromise, supportPromise]);
        listPromises.then(function(entities) {
          var supportList = entities[1];
          for (var j = 0; j < categories.length; j++) {
            var category = categories[j];
            vm.categoryServices[category.name] = [];
            for (var i = 0; i < vm.currentProject.services.length; i++) {
              var service = vm.currentProject.services[i];
              service.warning = vm.getServiceDisabledReason(service) || 
                                vm.getServiceWarningMessage(service);
              service.enabled = !vm.getServiceDisabledReason(service);
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
          vm.addSupportCategory(supportList);
          vm.setCategoryFromParams();
        });
        ncUtils.blockElement('store-content', listPromises);
      },
      setCategoryFromParams: function() {
        var vm = this;
        if ($stateParams.category) {
          for (var i = 0; i < vm.categories.length; i++) {
            var category = vm.categories[i];
            if (category.key === $stateParams.category) {
              vm.setCategory(category);
              return;
            }
          }
        }
      },
      loadProjectWithServices: function() {
        var vm = this;
        return currentStateService.getProject().then(function(project) {
          vm.currentProject = project;
          return joinService.getAll({
            project_uuid: project.uuid,
            field: ['url', 'quotas']
          }).then(function(services) {
            if (services.length === 0) {
              return;
            }
            angular.forEach(services, function(service) {
              var quotas = service.quotas.filter(function(quota) {
                return quota.limit !== -1 && quota.usage >= (quota.limit * vm.quotaThreshold);
              });
              service.reachedThreshold = quotas.length > 0;
              quotas = service.quotas.filter(function(quota) {
                return quota.limit !== -1 && quota.usage >= quota.limit;
              });
              service.reachedLimit = quotas.length === service.quotas.length && quotas.length > 0;
            });
            var details = services.reduce(function(result, service) {
              result[service.url] = service;
              return result;
            }, {});
            angular.forEach(vm.currentProject.services, function(service) {
              var detail = details[service.url];
              service.reachedThreshold = detail.reachedThreshold;
              service.reachedLimit = detail.reachedLimit;
            });
          });
        });
      },
      getServiceDisabledReason: function(service) {
        if (service.state === 'Erred') {
          return 'Provider is in erred state.';
        } else if (service.reachedLimit) {
          return 'All provider quotas have reached limit.';
        }
      },
      getServiceWarningMessage: function(service) {
        if (service.reachedThreshold) {
          return 'Provider quota have reached threshold.';
        }
      },
      addSupportCategory: function(list) {
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
            vm.loadingProviders = false;
            if (list.length != 0) {
              var category = {
                type: 'package',
                name: 'Support',
                icon: 'wrench',
                key: 'support',
                packages: list
              };
              vm.categories.push(category);
            }
        } else {
          vm.loadingProviders = false;
        }
      },
      selectSupportPackage: function(supportPackage) {
        this.agreementShow = true;
        this.selectedPackage = supportPackage;
        this.serviceType = 'Total';

        var type = 'Support plan';
        var display_name = supportPackage.name;

        this.deletePriceItem(type);
        this.pushPriceItem(type, display_name, supportPackage.base_rate);
      },
      signContract: function() {
        var contract = premiumSupportContractsService.$create();
        contract.project = this.currentProject.url;
        contract.plan = this.selectedPackage.url;
        var vm = this;
        return contract.$save().then(function(response) {
          premiumSupportContractsService.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshProjectList');
          $state.go('project.support', {uuid: vm.currentProject.uuid});
          return true;
        }, function(response) {
          vm.errors = response.data;
          vm.onError();
        });
      },
      canSave: function() {
        if (!this.instance) {
          return false;
        }
        for (var name in this.allFormOptions) {
          if (this.allFormOptions[name].required && (!this.instance[name] && this.instance[name] !== 0)) {
            return false;
          }
        }
        return true;
      },
      getTooltip: function() {
        if (!this.instance) {
          return "Instance is not configured";
        }
        var fields = [];
        for (var name in this.allFormOptions) {
          var options = this.allFormOptions[name];
          if (options.required && !this.instance[name]) {
            fields.push(options.label);
          }
        }
        if (fields.length > 0) {
          return "Please specify " + fields.join(", ").toLowerCase();
        }
      },
      getResourceUrl: function() {
        if (this.selectedResourceType === 'Tenant') {
          return ENV.apiEndpoint + 'api/openstack-packages/';
        }
        return this.serviceMetadata.resources[this.selectedResourceType];
      },
      saveInstance: function() {
        var resourceUrl = this.getResourceUrl();
        var instance = servicesService.$create(resourceUrl);
        instance.service_project_link = this.selectedService.service_project_link_url;

        for (var name in this.allFormOptions) {
          instance[name] = this.instance[name];
        }

        if (this.instance.system_volume_size) {
          instance.system_volume_size = this.instance.system_volume_size * 1024;
        }
        if (this.instance.data_volume_size) {
          instance.data_volume_size = this.instance.data_volume_size * 1024;
        }
        if (this.instance.security_groups) {
          instance.security_groups = [];
          for (var i = 0; i < this.instance.security_groups.length; i++) {
            instance.security_groups.push({url: this.instance.security_groups[i]});
          }
        }
        return instance.$save();
      },
      save: function() {
        if (this.instance.password !== this.instance.repeat_password) {
          this.errors.password = ['The passwords you have entered do not match.'];
          this.onError();
          return $q.reject();
        } else {
          delete this.instance.repeat_password;
        }
        return this._super();
      },
      afterSave: function() {
        this._super();
        projectsService.clearAllCacheForCurrentEndpoint();
        priceEstimationService.clearAllCacheForCurrentEndpoint();
      },
      onError: function() {
        var message = '';
        if (angular.isObject(this.errors)) {
          for (var name in this.errors) {
            if (this.allFormOptions[name]) {
              message += this.allFormOptions[name].label + ': ' + this.errors[name] + '<br/>';
            } else {
              message += name + ': ' + this.errors[name] + '<br/>';
            }
          }
        } else {
          message = 'Server error occurred';
        }
        ncUtilsFlash.error(message);
      },
      successRedirect: function(model) {
        if (this.isSupportSelected()) {
          return $state.go('project.support', {uuid: this.currentProject.uuid});
        } else if (this.selectedResourceType === 'Tenant') {
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
})();
