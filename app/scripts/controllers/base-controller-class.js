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
