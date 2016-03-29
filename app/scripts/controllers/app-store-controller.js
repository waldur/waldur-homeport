(function() {
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
      'ncUtilsFlash',
      'projectsService',
      'priceEstimationService',
      'keysService',
      'gitlabGroupsService',
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
    ncUtilsFlash,
    projectsService,
    priceEstimationService,
    keysService,
    gitlabGroupsService) {
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
      selectedResourceImageApiEndpoint: null,
      resourceImagesUrl: null,
      selectedResourceImagesCount: null,
      selectedResourceImagesPage: 1,
      selectedResourceImagesPageSize: 10,
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
      limitChoices: ENV.appStoreLimitChoices,
      fieldsOrder: null,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
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
        return this.selectedCategory.name == 'SUPPORT';
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
      setResourceType: function(type) {
        var vm = this;
        vm.selectedResourceType = type;
        vm.choiceDisplay = {};
        vm.selectedResourceTypeName = type.split(/(?=[A-Z])/).join(" ");
        vm.fields = [];
        var resourceUrl = vm.serviceMetadata.resources[vm.selectedResourceType];
        if (resourceUrl) {
          vm.instance = servicesService.$create(resourceUrl);
          vm.instance.service_project_link = vm.selectedService.service_project_link_url;

          var promise = servicesService.getOption(resourceUrl).then(function(response) {
            var formOptions = response.actions.POST;
            vm.allFormOptions = formOptions;
            return vm.getValidChoices().then(function(validChoices) {
              var gitlabGroupsPromise = gitlabGroupsService.getList({
                project_uuid: vm.currentProject.uuid,
                service_uuid: vm.selectedService.uuid
              });
              var sshKeysPromise = keysService.getCurrentUserKeyList();

              $q.all([gitlabGroupsPromise, sshKeysPromise]).then(function(result) {
                validChoices.sshPublicKeys = [];
                validChoices.group = [];
                result[0].forEach(function(item) {
                  validChoices.group.push(item);
                });
                result[1].forEach(function(item) {
                  validChoices.sshPublicKeys.push(item);
                });
                vm.setFields(formOptions, validChoices);
              });
            });
          });
          ncUtils.blockElement('resource-properties', promise);
        }
      },
      getValidChoices: function() {
        var vm = this;
        var promises = [];
        var validChoices = {};
        angular.forEach(vm.serviceMetadata.properties, function(url, property) {
          var promise,
          query = {
            settings_uuid: vm.selectedService.settings_uuid,
            project: vm.currentProject.uuid // for security groups
          };
          if (property === 'Image') {
            servicesService.pageSize = this.selectedResourceImagesPageSize;
            promise = servicesService.getList(query, url).then(function(response) {
              validChoices[property.toLowerCase()] = vm.formatChoices(response);
            });
            vm.resourceImagesUrl = url;
            vm.setResourceImagesApiEndpoint(url);
          } else {
            promise = servicesService.getAll(query, url).then(function(response) {
              validChoices[property.toLowerCase()] = vm.formatChoices(response);
            });
          }
          promises.push(promise);
        });
        return $q.all(promises).then(function() {
          return validChoices;
        });
      },
      setResourceImagesApiEndpoint: function(resourceUrl) {
        var resourceUrlParts = resourceUrl.split('/');
        this.selectedResourceImageApiEndpoint = resourceUrlParts[resourceUrlParts.length - 2];
        this.countResourceImages();
      },
      countResourceImages: function() {
        var vm = this;
        var fn = resourcesCountService[this.selectedResourceImageApiEndpoint];
        var query = {settings_uuid: vm.selectedService.settings_uuid};
        fn(query).then(function(count) {
          vm.selectedResourceImagesCount = count;
        });
      },
      formatChoices: function(items) {
        return items.map(function(item) {
          return {
            value: item.url,
            display_name: item.name,
            item: item
          }
        });
      },
      setFields: function(formOptions, validChoices) {
        this.fields = [];
        for (var name in formOptions) {
          var options = formOptions[name];
          if (options.read_only || name == this.UNIQUE_FIELDS.service_project_link) {
            continue;
          }

          var type = options.type;
          if (type == 'field') {
            type = 'choice';
          }

          var choices = validChoices[name] || options.choices;
          if (name === 'image') {
            for (var i = 0; i < choices.length; i++) {
             choices[i].display_name = choices[i].item.distribution
               ? choices[i].item.distribution + " " + choices[i].display_name
               : choices[i].display_name;
            }
          }
          if (name == 'security_groups') {
            choices = validChoices.securitygroup;
          }

          if (name == 'user_data') {
            type = 'text';
          }

          if (name == 'size' || name == 'flavor') {
            type = 'size';
          }
          if (name === 'ssh_public_key') {
            choices = validChoices.sshPublicKeys;
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
          var visibleFields = [
            'ssh_public_key',
            'group',
            'security_groups'
          ];
          var visible = required || visibleFields.indexOf(name) != -1;
          var help_text = options.help_text;
          var min, max, units;

          if (name == 'system_volume_size') {
            min = 0;
            max = 320;
            units = 'GB';
            help_text = null;
          }

          if (name == 'data_volume_size') {
            min = 1;
            max = 320;
            units = 'GB';
            visible = true;
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
            if (this.selectedCategory.name === 'VMs') {
              display_label = 'VM name';
            }
            if (this.selectedCategory.name === 'APPLICATIONS') {
              display_label = 'Name'
            }
          }

          this.fields.push({
            name: name,
            label: display_label ? display_label : label,
            type: type,
            help_text: help_text,
            required: required,
            choices: choices,
            visible: visible,
            icon: icon,
            min: min,
            max: max,
            units: units
          });
          display_label = null;
        }
        this.fieldsOrder = [
          'name', 'region', 'image', 'size', 'flavor', 'system_volume_size', 'data_volume_size',
          'security_groups', 'ssh_public_key', 'description', 'user_data'
        ];
        this.fields.sort(this.fieldsComparator.bind(this));
        this.sortFlavors();
        this.attachIconsToImages();
      },
      fieldsComparator: function(a, b) {
        return this.fieldsOrder.indexOf(a.name) - this.fieldsOrder.indexOf(b.name);
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
      serviceClass: function(service) {
        return {
          state: this.selectedService === service,
          disabled: !service.enabled,
          provider: this.selectedCategory.type === 'provider'
        };
      },
      toggleChoicesLimit: function(field) {
        if (field.limit == this.limitChoices) {
          field.limit = field.choices.length;
        } else {
          field.limit = this.limitChoices;
        }
      },
      isListLong: function(field) {
        return field.name === 'image'
          ? this.selectedResourceImagesCount > this.limitChoices
            && (this.selectedResourceImagesPageSize * this.selectedResourceImagesPage < this.selectedResourceImagesCount)
          : field.choices.length > this.limitChoices;
      },
      remoteLoadMore: function(fieldName) {
        return fieldName === 'image';
      },
      loadMoreImages: function(field) {
        field.limit += this.selectedResourceImagesPageSize;
        var vm = this,
        query = {
          settings_uuid: this.selectedService.settings_uuid,
          project: this.currentProject.uuid, // for security groups
          page: ++this.selectedResourceImagesPage
        };
        servicesService.pageSize = this.selectedResourceImagesPageSize;
        servicesService.getList(query, this.resourceImagesUrl).then(function(response) {
          var choices = vm.formatChoices(response);
          field.choices = field.choices.concat(choices);
          vm.attachIconsToImages();
        });
      },
      isListExpanded: function(field) {
        return field.limit == field.choices.length;
      },
      choiceDisplay: {},
      doChoice: function(name, choice) {
        var vm = this;
        this.choiceDisplay[name] = choice.display_name || choice.name;
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
          var field = this.findFieldByName(name);
          for (var i = 0; i < field.choices.length; i++) {
            var c = field.choices[i];
            if (this.instance[name].indexOf(c.value) !== -1) {
              parts.push(c.display_name || c.name);
            }
          }
          this.choiceDisplay[name] = parts.join(', ');
        } else if (name === 'ssh_public_key') {
          this.instance[name] = choice.url;
          this.instance[name + '_item'] = choice
        } else if (name === 'group') {
          this.instance[name] = choice.url;
          this.instance[name + '_item'] = choice;
        } else {
          this.instance[name] = choice.value;
          this.instance[name + '_item'] = choice;
        }
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
        if (ENV.nonChargeableAppStoreOptions.indexOf(name) !== -1) {
          return;
        }
        defaultPriceListItemsService.getAll({resource_type: vm.serviceType + '.' + vm.selectedResourceType}).then(function(response) {
          vm.defaultPriceListItems = response;
          vm.setPriceItem(name, choice);
        });
      },
      isChosen: function(name, choice) {
        var value = (name == 'ssh_public_key') ? choice.url : choice.value;
        value = (name == 'group') ? this.instance[name] : value;
        if (value == undefined) {
          return false;
        }
        if (name == 'group' && this.instance[name]) {
          return choice.url === this.instance[name];
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
          this.deletePriceItem('image');
        }
        this.sortImages();
      },
      setSize: function() {
        var field = this.findFieldByName('system_volume_size');
        if (!field) {
          return;
        }
        var disk_gb = Math.round(this.instance.flavor_item.disk / 1024);
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
          return false;
        }
        for (var i = 0; i < field.choices.length; i++) {
          var choice = field.choices[i];
          choice.disabled = image.min_ram > choice.item.ram || image.min_disk > choice.item.disk;
        }

        var flavor = this.instance.flavor;
        var choice = this.getChoiceByValue(field.choices, flavor);
        if (choice && choice.disabled) {
          this.instance.flavor = null;
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
      setPriceItem: function(name, choice) {
        this.deletePriceItem(name);
        var display_name = choice.display_name;
        var price = this.findPrice(name, display_name);
        price = price ? price : 0;
        display_name = choice.display_name;
        this.pushPriceItem(name, display_name, price);
      },
      findPrice: function(name, display_name) {
        for (var i = 0; i < this.defaultPriceListItems.length; i++) {
          var priceItem = this.defaultPriceListItems[i];
          var keyExists = display_name.indexOf(priceItem.key) > -1;
          if (priceItem.item_type === name && keyExists) {
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

        var projectsPromise = currentStateService.getProject(),
            supportPromise = premiumSupportPlansService.getList(),
          listPromises = $q.all([projectsPromise, supportPromise]);
        listPromises.then(function(entities) {
          vm.currentProject = entities[0];
          var supportList = entities[1];
          for (var j = 0; j < categories.length; j++) {
            var category = categories[j];
            vm.categoryServices[category.name] = [];
            for (var i = 0; i < vm.currentProject.services.length; i++) {
              var service = vm.currentProject.services[i];
              service.enabled = vm.isSafeState(service.state);
              if (category.services && (category.services.indexOf(service.type) + 1)) {
                vm.categoryServices[category.name].push(service);
              }
            }
            if (vm.categoryServices[category.name].length > 0) {
              vm.categories.push(category);
              vm.renderStore = true;
            }
            vm.categoryServices[category.name].sort(function(a, b) {
              return a.enabled < b.enabled;
            });
          }
          vm.addSupportCategory(supportList);
        });
        ncUtils.blockElement('store-content', listPromises);
      },
      isSafeState: function(state) {
        return state !== 'Erred';
      },
      addSupportCategory: function(list) {
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
            vm.loadingProviders = false;
            if (list.length != 0) {
              vm.renderStore = true;
              var category = {
                type: 'package',
                name: 'SUPPORT',
                icon: 'wrench',
                packages: list
              };
              vm.categories.push(category);
              if ($stateParams.category == 'support') {
                vm.setCategory(category);
              }
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
          $state.go('resources.list', {tab: 'premiumSupport'});
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
      saveInstance: function() {
        var resourceUrl = this.serviceMetadata.resources[this.selectedResourceType];
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
        if (this.isVirtualMachinesSelected() || this.isApplicationSelected()) {
          $state.go('resources.details', {uuid: model.uuid, resource_type: model.resource_type});
        } else if (this.isSupportSelected()) {
          return $state.go('resources.list', {tab: 'premiumSupport'});
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
