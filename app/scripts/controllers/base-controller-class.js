(function(){
  angular.module('ncsaas')
    .service('baseControllerClass', ['ncUtilsFlash', baseControllerClass]);

  // This class is deprecated. Use ES6 class instead.
  function baseControllerClass(ncUtilsFlash) {
    var ControllerClass = Class.extend({
      init: function() {},
      handleActionException: function(response) {
        if (response.status === 409) {
          var message = response.data.detail || response.data.status;
          ncUtilsFlash.error(message);
        }
      }
    });

    return ControllerClass;
  }
})();

(function(){

  angular.module('ncsaas')
    .service('baseControllerListClass', [
      'baseControllerClass', 'ENV', '$rootScope', 'currentStateService', 'ncUtils', baseControllerListClass
    ]);

  function baseControllerListClass(baseControllerClass, ENV, $rootScope, currentStateService, ncUtils) {
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
        var vm = this;
        filter = filter || {};
        vm.service.cacheTime = vm.cacheTime;
        filter = angular.extend(filter, this.getFilter());
        var promise = vm.service.getList(filter).then(function(response) {
          if (vm.mergeListFieldIdentifier) {
            vm.list = ncUtils.mergeLists(vm.list, response, vm.mergeListFieldIdentifier);
          } else {
            vm.list = response;
          }
          vm.afterGetList(filter);
          if (vm.controllerScope && vm.controllerScope.onListReceive) {
            vm.controllerScope.onListReceive({
              $event: {
                filter: filter,
                response: response
              }
            });
          }
          vm.hideNoDataText = false;
        });
        vm.blockListElement(promise);
        return promise;
      },
      getFilter: function() {
        return {};
      },
      requestLoad: function(request, filter) {
        var vm = this;
        if (request.search.value) {
          filter[this.tableOptions.searchFieldName] = request.search.value;
        }
        vm.searchInput = request.search.value;
        vm.service.pageSize = request.length;
        vm.service.page = Math.ceil(request.start / request.length) + 1;
        return vm.getList(filter);
      },
      resetCache: function () {
        if (!this.enableRefresh) {
          return;
        }
        var vm = this;
        var filter = {};
        if (vm.searchInput) {
          filter[vm.searchFieldName] = vm.searchInput;
        }
        vm.service.cacheReset = true;
        vm.service.clearAllCacheForCurrentEndpoint();
        return vm.getList(filter);
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
      generalSearchChanged: function(event, text) {
        this.controllerScope.searchInput = text;
        this.controllerScope.search();
      },
      search: function() {
        var vm = this;
        var filter = {};
        filter[vm.searchFieldName] = vm.searchInput;
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
      changeAllSelectedInstances: function() {
        if (this.selectedInstances.length) {
          this.selectedInstances = [];
        } else {
          for (var i = 0; i < this.list.length; i++) {
            this.selectedInstances.push(this.list[i][this.uniqueModelKeyName]);
          }
        }
      },
      changeInstanceSelection: function(instance) {
        var index = this.selectedInstances.indexOf(instance[this.uniqueModelKeyName]);
        if (index !== -1) {
          this.selectedInstances.splice(index, 1);
        } else {
          this.selectedInstances.push(instance[this.uniqueModelKeyName]);
        }
      },
      isInstanceSelected: function(instance) {
        return this.selectedInstances.indexOf(instance[this.uniqueModelKeyName]) !== -1;
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

})();

(function(){

  angular.module('ncsaas')
    .service('baseControllerAddClass', [
      '$rootScope', '$state', 'baseControllerClass', 'currentStateService', 'ncUtilsFlash', baseControllerAddClass]);

  function baseControllerAddClass($rootScope, $state, baseControllerClass, currentStateService, ncUtilsFlash) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     * sеt events in this._signals
     */
    var ControllerAddClass = baseControllerClass.extend({
      service: null, // required in init
      instance: null,
      listState: null, // required in init
      errors: {},
      controllerScope: null, // required in init
      detailsState: null,
      redirectToDetailsPage: false,
      successMessage: gettext('Saving of {vm_name} was successful.'),

      init: function() {
        this.instance = this.service.$create();
        this.activate();
        this._super();
      },
      save: function() {
        var vm = this;
        vm.beforeSave();
        return vm.saveInstance().then(function(model) {
          vm.afterSave(model);
          ncUtilsFlash.success(vm.getSuccessMessage());
          vm.service.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshCounts');
          vm.successRedirect(model);
          return true;
        }, function(response) {
          vm.errors = response.data;
          vm.onError(response);
        });
      },
      cancel: function() {
        var vm = this;
        $state.go(vm.listState);
      },
      beforeSave: function() {},
      saveInstance: function() {
        return this.instance.$save();
      },
      afterSave: function() {
        currentStateService.reloadCurrentCustomer(function() {
          $rootScope.$broadcast('checkQuotas:refresh');
          $rootScope.$broadcast('customerBalance:refresh');
        });
      },
      activate: function() {},
      successRedirect: function() {
        if (this.redirectToDetailsPage) {
          $state.go(this.detailsState, {uuid: this.instance.uuid});
        } else {
          $state.go(this.listState);
        }
      },
      getSuccessMessage: function() {
        return this.successMessage.replace('{vm_name}', this.instance.name);
      },
      onError: function(errorObject) {}
    });

    return ControllerAddClass;
  }

})();

(function() {
  angular.module('ncsaas')
    .service('baseControllerDetailUpdateClass', [
      '$state',
      '$q',
      'baseControllerClass',
      '$stateParams',
      '$rootScope',
      'ENV',
      baseControllerDetailUpdateClass]);

  function baseControllerDetailUpdateClass(
      $state,
      $q,
      baseControllerClass,
      $stateParams,
      $rootScope,
      ENV) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     * sеt events in this._signals
     */
    var ControllerDetailUpdateClass = baseControllerClass.extend({
      service: null, // required in init
      detailsState: null, // required in init
      listState: null, // required in init for details page
      activeTab: null,
      model: null,
      generalSearch: null,

      init: function() {
        this._super();
        this.activate();
      },
      getActiveTab: function() {
        var key = this.getActiveTabKey();
        if (key) {
          return this.getTabByKey(key);
        }
      },
      getActiveTabKey: function() {
        var defaultTab;
        for (var i = 0; i < this.detailsViewOptions.tabs.length; i++) {
          var tab = this.detailsViewOptions.tabs[i].key;
          if (tab && (ENV.featuresVisible || ENV.toBeFeatures.indexOf(tab) === -1)) {
            defaultTab = !defaultTab ? tab : defaultTab;
            if (tab === $stateParams.tab) {
              return tab;
            }
          }
        }
        return defaultTab;
      },
      getTabByKey: function(key) {
        for (var i = 0; i < this.detailsViewOptions.tabs.length; i++) {
          var tab = this.detailsViewOptions.tabs[i];
          if (tab.key == key) {
            return tab;
          }
        }
      },
      setCounters: function() {
        var vm = this;
        vm.getCounters().then(function(response) {
          for (var i = 0; i < vm.detailsViewOptions.tabs.length; i++) {
            var tab = vm.detailsViewOptions.tabs[i];
            var key = tab.countFieldKey;
            if (key) {
              tab.count = response[key];
            }
          }
        }, vm.getCountersError);
      },
      getCountersError: function() {},
      getCounters: function() {
        // It should return promise
        return $q.reject();
      },
      update: function() {
        var vm = this;
        vm.beforeUpdate();
        return vm.updateInstance().then(function() {
          if (vm.service.clearAllCacheForCurrentEndpoint) {
            vm.service.clearAllCacheForCurrentEndpoint();
          }
          $rootScope.$broadcast('refreshCounts');
          vm.afterUpdate();
          vm.successRedirect();
        },
        function(response) {
          vm.errors = response.data;
        });
      },
      updateInstance: function() {
        return this.model.$update();
      },
      editInPlace: function(data, fieldName) {
        this.model[fieldName] = data;
        return this.update();
      },
      activate: function() {
        var vm = this;
        vm.loading = true;
        vm.getModel().then(function(response) {
          vm.model = response;
          vm.afterActivate(response);
        }, vm.modelNotFound.bind(vm))
        .finally(function() {
          vm.loading = false;
        });
      },
      getModel: function() {
        return this.service.$get($stateParams.uuid);
      },
      modelNotFound: function(error) {
        if (error.status == 404) {
          $state.go('errorPage.notFound');
        }
      },
      remove: function() {
        var vm = this;
        if (confirm('Confirm deletion?')) {
          vm.model.$delete(
            function() {
              vm.service.clearAllCacheForCurrentEndpoint();
              $rootScope.$broadcast('refreshCounts');
              $state.go(vm.listState);
            },
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      },
      successRedirect: function() {
        if (this.detailsState) {
          $state.go(this.detailsState, {uuid: this.model.uuid});
        }
      },
      beforeUpdate: function() {},
      afterUpdate: function() {},
      afterActivate: function() {}
    });

    return ControllerDetailUpdateClass;
  }
})();
