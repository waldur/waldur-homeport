// @ngInject
export default function baseControllerListClass(baseControllerClass, ENV, $rootScope, currentStateService, ncUtils) {
  /**
   * Use controllerScope.__proto__ = new Controller() in needed controller
   * use this.controllerScope for changes in event handler
   */
  var ControllerListClass = baseControllerClass.extend({
    list: [],
    service: null, // required in init
    searchInput: '',
    searchFieldName: 'name', // required in init
    controllerScope: null, // required in init
    showgroup: false, // for showing group buttons and checkboxes in list view
    // checkboxes
    selectedInstances: [],
    uniqueModelKeyName: 'uuid',
    // filters
    searchFilters: [], // should contains array of objects {name: 'name', title: 'Title', value: 'value'}
    chosenFilters: [],
    cacheTime: ENV.defaultListCacheTime,
    controlPanelShow: true,
    mergeListFieldIdentifier: null,

    init: function() {
      this.service.page = 1;
      this.service.cacheTime = this.cacheTime;
      this._super();
      this.hideNoDataText = true;
      this.listPromise = this.getList();
      this.blockListElement();
      // reset after state change
      this.selectedInstances = [];
      this.controlPanelShow = ENV.listControlPanelShow;
      this.enableRefresh = true;
    },
    getList: function(filter) {
      // It should return promise
      filter = filter || {};
      this.service.cacheTime = this.cacheTime;
      filter = angular.extend(filter, this.getFilter());
      var promise = this.service.getList(filter).then(response => {
        if (this.mergeListFieldIdentifier) {
          this.list = ncUtils.mergeLists(this.list, response, this.mergeListFieldIdentifier);
        } else {
          this.list = response;
        }
        this.afterGetList(filter);
        if (this.controllerScope && this.controllerScope.onListReceive) {
          this.controllerScope.onListReceive({
            $event: {
              filter: filter,
              response: response
            }
          });
        }
        this.hideNoDataText = false;
      });
      this.blockListElement(promise);
      return promise;
    },
    getFilter: function() {
      return {};
    },
    requestLoad: function(request, filter) {
      if (request.search.value) {
        filter[this.tableOptions.searchFieldName] = request.search.value;
      }
      this.searchInput = request.search.value;
      this.service.pageSize = request.length;
      this.service.page = Math.ceil(request.start / request.length) + 1;
      return this.getList(filter);
    },
    resetCache: function() {
      if (!this.enableRefresh) {
        return;
      }
      var filter = {};
      if (this.searchInput) {
        filter[this.searchFieldName] = this.searchInput;
      }
      this.service.cacheReset = true;
      this.service.clearAllCacheForCurrentEndpoint();
      return this.getList(filter);
    },
    getTotal: function() {
      return this.service.resultCount;
    },
    blockListElement: function() {
      if (this.listPromise && this.listPromise.finally) {
        this.loading = true;
        this.listPromise.finally(function() {
          this.loading = false;
        }.bind(this));
      }
    },
    afterGetList: function() {},
    search: function() {
      var filter = {};
      filter[this.searchFieldName] = this.searchInput;
      this.currentPage = this.service.page = 1;
      this.getList(filter);
    },
    remove: function(model) {
      var vm = this.controllerScope;
      var confirmDelete = confirm('Confirm deletion?');
      if (confirmDelete) {
        vm.removeInstance(model).then(function() {
          vm.afterInstanceRemove(model);
        }, vm.handleActionException.bind(vm));
      }
    },
    removeInstance: function(model) {
      // Shall return promise
      return model.$delete();
    },
    afterInstanceRemove: function(instance) {
      this.service.setPagesCount(this.service.resultCount - 1);
      this.service.clearAllCacheForCurrentEndpoint();
      $rootScope.$broadcast('refreshCounts');
      var index = this.list.indexOf(instance);
      if (index !== -1) {
        this.list.splice(index, 1);
      }

      index = this.selectedInstances.indexOf(instance[this.uniqueModelKeyName]);
      if (index !== -1) {
        this.selectedInstances.splice(index, 1);
      }

      if (this.list.length === 0 && this.currentPage > 1) {
        this.controllerScope.service.page = this.controllerScope.currentPage = this.currentPage - 1;
        this.controllerScope.getList();
      }

      currentStateService.reloadCurrentCustomer(function() {
        $rootScope.$broadcast('checkQuotas:refresh');
        $rootScope.$broadcast('customerBalance:refresh');
      });
    },
    showMore: function() {},
    toggleRefresh: function(open) {
      this.enableRefresh = !open;
    }
  });

  return ControllerListClass;
}
