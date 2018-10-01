function loadDatatables() {
  return import(/* webpackChunkName: "datatables" */ '../../shims/datatables');
}

// @ngInject
export default function baseControllerListClass(baseControllerClass, ENV, $rootScope, currentStateService, ncUtils) {
  /**
   * Use controllerScope.__proto__ = new Controller() in needed controller
   * use this.controllerScope for changes in event handler
   */
  let ControllerListClass = baseControllerClass.extend({
    list: [],
    service: null, // required in init
    searchInput: '',
    searchFieldName: 'name', // required in init
    controllerScope: null, // required in init
    cacheTime: ENV.defaultListCacheTime,
    mergeListFieldIdentifier: null,

    init: function() {
      // TODO: Fix all cases where controllerScope is not set
      // if (!this.controllerScope) {
      //   throw new Error('Please register controller scope in the init method');
      // }

      // TODO: Fix all cases where service is not set
      // if (!this.service) {
      //   throw new Error('Please register service in the init method');
      // }

      this.service.page = 1;
      this.service.cacheTime = this.cacheTime;
      this.userFilter = this.getUserFilter();
      this.selectFilter = this.getSelectFilter();
      this.orderField = '';
      this._super();
      this.hideNoDataText = true;
      this.initialized = false;
      loadDatatables().then(() => {
        this.listPromise = this.getList().finally(() => this.initialized = true);
        this.blockListElement();
      });
      // reset after state change
      this.enableRefresh = true;
      $rootScope.$on('resourceDeletion', this.toggleRefresh.bind(this));
    },
    hasChosenUserFilter: function() {
      return this.userFilter.choices.filter(x => x.chosen).length > 0;
    },
    getUserFilter: function() {
      /* It is expected that subclass returns object with the following format:
      {
        name: 'state',
        choices: [
          {
            title: gettext('Pending'),
            value: 'pending',
            chosen: true
          },
          {
            title: gettext('Canceled'),
            value: 'canceled'
          }
        ]
      }
      It is rendered as button group. When user clicks on button, search results are updated.
      For example, if first choice is chosen, API request looks as following: ?state=pending
      If both choices are chosen, API request looks as following: ?state=pending&state=canceled
      */
      return {};
    },
    getSelectFilter: function() {
      /* It is expected that subclass returns object with the same format as getUserFilter method.
       * The only difference is that filter is rendered as select box.
       */
      return {};
    },
    getChosenUserFilter: function() {
      let filters = {...this.selectFilter.value};
      if (this.userFilter.choices) {
        const values = this.userFilter.choices.filter(x => x.chosen).map(x => x.value);
        filters[this.userFilter.name] = values;
      }
      return filters;
    },
    getList: function(filter) {
      // It should return promise
      filter = filter || {};
      this.orderField = filter.o || this.orderField;
      this.service.cacheTime = this.cacheTime;
      filter = angular.extend(filter, this.getChosenUserFilter(), this.getFilter());
      this.listPromise = this.service.getList(filter).then(response => {
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
      this.blockListElement();
      return this.listPromise;
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
      let filter = {};
      if (this.orderField) {
        filter.o = this.orderField;
      }
      if (this.searchInput) {
        filter[this.searchFieldName] = this.searchInput;
      }
      this.service.cacheReset = true;
      this.service.clearAllCacheForCurrentEndpoint();
      return this.getList(filter).then(() => {
        $rootScope.$broadcast('refreshCounts');
      });
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
      let filter = {};
      filter[this.searchFieldName] = this.searchInput;
      this.currentPage = this.service.page = 1;
      this.getList(filter);
    },
    remove: function(model) {
      let vm = this.controllerScope;
      let confirmDelete = confirm(gettext('Confirm deletion?'));
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
      let index = this.list.indexOf(instance);
      if (index !== -1) {
        this.list.splice(index, 1);
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
    },
    findIndexById: function(row) {
      let index;
      let list = this.controllerScope.list;
      for (let i = 0; i < list.length; i++) {
        if (list[i].uuid === row.uuid) {
          index = i;
        }
      }
      return index;
    },
    renderLongText: function(value) {
      return `<span class="ellipsis" style="width: 150px;" uib-tooltip="${value}">${value}</span>`;
    },
  });

  return ControllerListClass;
}
