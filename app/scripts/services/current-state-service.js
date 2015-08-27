'use strict';

(function() {
  angular.module('ncsaas')
    .service('currentStateService', ['$q', '$window', 'ENV', currentStateService]);

  /**
   * This service contains values of objects, that affect current displayed data.
   * Notice: CurrentStateService can not make any backend calls. It stores only selected on user-side objects.
   */
  function currentStateService($q, $window, ENV) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCustomer = getCustomer;
    vm.setCustomer = setCustomer;
    vm.isCustomerDefined = false;

    vm.getActiveItem = getActiveItem;
    vm.getBodyClass = getBodyClass;

    vm.getProject = getProject;
    vm.setProject = setProject;

    // private variables:
    var customer = null,
      project = null;

    function getCustomer() {
      return customer;
    }

    function getProject() {
      var deferred = $q.defer();
      if (project) {
        deferred.resolve(project)
      } else {
        deferred.reject();
      }
      return deferred.promise;
    }

    function setCustomer(newCustomer) {
      vm.isCustomerDefined = true;
      customer = $q.when(newCustomer);
      customer.then(function(response) {
        $window.localStorage[ENV.currentCustomerUuidStorageKey] = response.uuid;
      })
    }

    function setProject(newProject) {
      if (newProject) {
        project = $q.when(newProject);
        project.then(function(response) {
          if (response) {
            $window.localStorage[ENV.currentProjectUuidStorageKey] = response.uuid;
          }
        });
      } else {
        project = undefined;
      }
    }

    // XXX: getActiveItem and getBodyClass methods have to be moved to apps.js for code consistency.
    // (We decided, that all URL-depended code have to defined near URLs definition)

    // Active menuItem
    var urlList = {
      appstore: ['appstore.store'],
      dashboard: ['dashboard.index', 'dashboard.eventlog'],
      resources: ['resources.list', 'resources.create'],
      projects: ['projects.list', 'projects.details', 'projects.create', 'projects.add-users'],
      services: ['services.list', 'services.create', 'services.details'],
      users: ['users.list', 'users.details'],
      support: ['support.list', 'support.create']
    };

    function getActiveItem(stateName) {
      var activeState;
      for (var prop in urlList) {
        if (urlList.hasOwnProperty(prop)) {
          if (urlList[prop].indexOf(stateName) !== -1) {
            activeState = prop;
          }
        }
      }
      return activeState;
    }

    // Body class
    var stateWithProfile = [
      'profile',
      'profile-edit',
      'projects.details',
      'organizations.details',
      'customer-plans',
      'users.details',
      'home',
      'login',
    ];

    function getBodyClass(name) {
      var bodyClass;

      if (stateWithProfile.indexOf(name) > -1) {
        if (name === 'login' || name === 'home') {
          bodyClass = 'app-body site-body';
          return bodyClass;
        } else {
          bodyClass = 'app-body obj-view';
          return bodyClass;
        }
      } else {
        bodyClass = 'app-body';
        return bodyClass;
      }
    }

  }

})();
