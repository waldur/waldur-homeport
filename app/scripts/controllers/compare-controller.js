(function() {
  angular.module('ncsaas')
    .controller('CompareController', [
      'baseControllerClass',
      'currentStateService',
      'defaultPriceListItemsService',
      'servicesService',
      'ENTITYLISTFIELDTYPES',
      '$q',
      'ncUtils',
      '$filter',
      CompareController
    ]);

  function CompareController(
    baseControllerClass, currentStateService, defaultPriceListItemsService, servicesService, ENTITYLISTFIELDTYPES, $q, ncUtils, $filter) {
    var controllerScope = this;
    var CompareController = baseControllerClass.extend({
      init:function() {
        this.service = defaultPriceListItemsService;
        this.controllerScope = controllerScope;
        this.servicesMetadata = null;
        this.initialListLength = null;
        this.itemsToShow = null;
        this.list = [];
        this.servicesTypes = [];
        this.listFilters = [];
        this._super();
        this.activate();
        this.orderField = 'value';
        this.reverseOrder = false;
        var vm = this;

        this.entityOptions = {
          entityData: {
            noDataText: 'No items to compare yet.',
            noMatchesText: 'No items found matching filter.',
            title: 'Compare',
            hidePagination: true,
            hideActionButtons: true,
            hideSearch: true,
            hideControlButtons: true,
            loadMoreButton: true
          },
          list: [
            {
              name: "Provider",
              propertyName: "resource_type",
              type: ENTITYLISTFIELDTYPES.icon,
              showForMobile: true,
              className: 'icon',
              getTitle: function(item) {
                return item.resource_type;
              },
              getIcon: function(item) {
                var service_type = item.resource_type.split(".")[0];
                return "/static/images/appstore/icon-" + service_type.toLowerCase() + ".png";
              }
            },
            {
              name: 'Code',
              propertyName: 'key',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Name',
              propertyName: 'metadataName',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile,
              initField: function(item) {
                item.metadataName = item.metadata.name;
              }
            },
            {
              name: 'CPU',
              propertyName: 'metadataCores',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile,
              initField: function(item) {
                item.metadataCores = item.metadata.cores;
              }
            },
            {
              name: 'RAM',
              propertyName: 'metadataRam',
              filtered: 'filteredRam',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile,
              initField: function(item) {
                item.metadataRam = item.metadata.ram;
                item.metadataRam && (item.filteredRam = $filter('mb2gb')(item.metadata.ram));
              }
            },
            {
              name: 'Storage',
              propertyName: 'metadataDisk',
              filtered: 'filteredDisk',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile,
              initField: function(item) {
                item.metadataDisk = item.metadata.disk;
                item.metadataDisk && (item.filteredDisk = $filter('mb2gb')(item.metadata.disk));
              }
            },
            {
              name: 'Price/hour',
              propertyName: 'value',
              type: ENTITYLISTFIELDTYPES.name,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile,
              initField: function(item) {
                item.value = $filter('defaultCurrency')(item.value);
              }
            }
          ]
        };
      },
      activate: function() {
        this.setCurrentUserData();
      },
      setCurrentUserData: function() {
        var currentCustomerPromise = currentStateService.getCustomer(),
          currentProjectPromise = currentStateService.getProject(),
          servicesPromise = servicesService.getServicesList();
        vm = this;
        $q.all([currentCustomerPromise, currentProjectPromise, servicesPromise]).then(function(result) {
          vm.currentCustomer = result[0];
          vm.currentProject = result[1];
          vm.servicesMetadata = result[2];
          vm.getDefaultPriceListItems();
        });
      },
      getDefaultPriceListItems: function() {
        var vm = this;
        defaultPriceListItemsService.pageSize = 100;
        return defaultPriceListItemsService.getList({page: 1, item_type: 'flavor'}).then(function(response) {
          vm.list = response;
          vm.setServiceTypes(response);
          var getAllPromise = defaultPriceListItemsService.getAll({item_type: 'flavor'}).then(function(response) {
            vm.initialListLength = response.length;
            vm.list.length < response.length && (vm.itemsToShow = response.splice(10));
          });
          ncUtils.blockElement('load-more', getAllPromise);
        });
      },
      loadMore: function() {
        var piece = this.itemsToShow.splice(0,10);
        this.setServiceTypes(piece);
        this.list = this.list.concat(piece);
      },
      setServiceTypes: function(list) {
        var vm = this;
        list.forEach(function(item, i) {
          vm.servicesTypes.indexOf(item.resource_type) === -1 && (vm.servicesTypes.push(item.resource_type));
        });
      },
      toggleFilter: function(filter) {
        if (!this.isFilterChosen(filter)) {
          this.listFilters.push(filter);
        } else {
          var index = this.listFilters.indexOf(filter);
          this.listFilters.splice(index, 1);
        }
      },
      isFilterChosen: function(filter) {
        return this.listFilters.indexOf(filter) !== -1;
      },
      filterResults: function(value) {
        if (!controllerScope.listFilters.length) {
          return true;
        }
        return (controllerScope.listFilters.indexOf(value.resource_type) > -1);
      }
    });

    controllerScope.__proto__ = new CompareController();
  }

})();
