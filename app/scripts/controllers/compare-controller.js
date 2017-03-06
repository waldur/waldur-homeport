(function() {
  angular.module('ncsaas')
    .controller('CompareController', [
      'baseControllerClass',
      'currentStateService',
      'defaultPriceListItemsService',
      'servicesService',
      'resourceUtils',
      'ENTITYLISTFIELDTYPES',
      '$q',
      'ncUtils',
      '$filter',
      CompareController
    ]);

  function CompareController(
    baseControllerClass,
    currentStateService,
    defaultPriceListItemsService,
    servicesService,
    resourceUtils,
    ENTITYLISTFIELDTYPES,
    $q,
    ncUtils,
    $filter) {
    var controllerScope = this;
    var CompareController = baseControllerClass.extend({
      init:function() {
        this._super();
        this.service = defaultPriceListItemsService;
        this.controllerScope = controllerScope;
        this.servicesMetadata = null;
        this.initialListLength = null;
        this.itemsToShow = null;
        this.list = [];
        this.servicesTypes = [];
        this.listFilters = [];
        this.activate();
        this.orderField = 'value';
        this.reverseOrder = false;
        this.hideNoDataText = true;

        this.entityOptions = {
          entityData: {
            noDataText: gettext('No items to compare yet.'),
            noMatchesText: gettext('No items found matching filter.'),
            hidePagination: true,
            hideActionButtons: true,
            hideSearch: true,
            hideControlButtons: true,
            loadMoreButton: true,
            rowTemplateUrl: 'views/compare/row.html',
            filterTemplateUrl: 'views/compare/filter.html'
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
              getIcon: resourceUtils.getIcon,
              notSortable: true
            },
            {
              name: 'Code',
              propertyName: 'key',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              notSortable: true
            },
            {
              name: 'Name',
              propertyName: 'metadataName',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              initField: function(item) {
                item.metadataName = item.metadata.name;
              },
              notSortable: true
            },
            {
              name: 'CPU',
              propertyName: 'metadataCores',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              initField: function(item) {
                item.metadataCores = item.metadata.cores;
              }
            },
            {
              name: 'RAM',
              propertyName: 'metadataRam',
              filtered: 'filteredRam',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              initField: function(item) {
                item.metadataRam = item.metadata.ram;
                item.metadataRam && (item.filteredRam = $filter('filesize')(item.metadata.ram));
              }
            },
            {
              name: 'Storage',
              propertyName: 'metadataDisk',
              filtered: 'filteredDisk',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              initField: function(item) {
                item.metadataDisk = item.metadata.disk;
                item.metadataDisk && (item.filteredDisk = $filter('filesize')(item.metadata.disk));
              }
            },
            {
              name: 'Price/hour',
              propertyName: 'value',
              type: ENTITYLISTFIELDTYPES.name,
              initField: function(item) {
                item.value = $filter('defaultCurrency')(item.value);
              }
            }
          ]
        };
      },
      filterByResourceType: function(value) {
        if (value) {
          this.filterResults = {resource_type: value};
        } else {
          this.filterResults = null;
        }
      },
      activate: function() {
        controllerScope.loading = true;
        this.setCurrentUserData().finally(function() {
          controllerScope.loading = false;
        });
      },
      setCurrentUserData: function() {
        var currentCustomerPromise = currentStateService.getCustomer(),
          currentProjectPromise = currentStateService.getProject(),
          servicesPromise = servicesService.getServicesList();
        var vm = this;
        return $q.all([currentCustomerPromise, currentProjectPromise, servicesPromise]).then(function(result) {
          vm.currentCustomer = result[0];
          vm.currentProject = result[1];
          vm.servicesMetadata = result[2];
          return vm.getDefaultPriceListItems();
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
            vm.hideNoDataText = false;
          }, function(error) {
            vm.hideNoDataText = false;
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
