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
