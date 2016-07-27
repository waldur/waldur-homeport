'use strict';

(function() {
  angular.module('ncsaas')
    .service('currentStateService', ['$q', '$window', 'ENV', 'ncUtils', currentStateService]);

  /**
   * This service contains values of objects, that affect current displayed data.
   * Notice: CurrentStateService can not make any backend calls. It stores only selected on user-side objects.
   */
  function currentStateService($q, $window, ENV, ncUtils) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCustomer = getCustomer;
    vm.setCustomer = setCustomer;
    vm.reloadCurrentCustomer = reloadCurrentCustomer;
    vm.isCustomerDefined = false;

    vm.getActiveItem = getActiveItem;
    vm.getBodyClass = getBodyClass;

    vm.getProject = getProject;
    vm.setProject = setProject;
    vm.handleSelectedProjects = handleSelectedProjects;
    vm.removeLastSelectedProject = removeLastSelectedProject;
    vm.getCustomerUuid = getCustomerUuid;
    vm.getProjectUuid = getProjectUuid;
    vm.isQuotaExceeded = isQuotaExceeded;

    // private variables:
    var customer = null,
      project = null;

    function getCustomer() {
      return customer;
    }

    function getCustomerUuid() {
      return $window.localStorage[ENV.currentCustomerUuidStorageKey];
    }

    function getProjectUuid() {
      return $window.localStorage[ENV.currentProjectUuidStorageKey];
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
        if (response) {
          $window.localStorage[ENV.currentCustomerUuidStorageKey] = response.uuid;
        }
      });
    }

    function isQuotaExceeded(entity) {
      return vm.getCustomer().then(function(response) {
        for (var i = 0; i < response.quotas.length; i++) {
          var value = response.quotas[i];
          var name = ncUtils.getPrettyQuotaName(value.name);
          if (entity && name === entity && value.limit > -1 && (value.limit === value.usage || value.limit === 0)) {
            return {name: name, usage: [value.limit, value.usage]};
          }
        }
        return false;
      });
    }

    function reloadCurrentCustomer(callback) {
      vm = this;
      vm.getCustomer().then(function(customer) {
        customer && customer.$get().then(function(customer) {
          vm.setCustomer(customer);
          callback(customer);
        });
      });
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

    function handleSelectedProjects(currentCustomer, projectUuid) {
      var selectedProjects = $window.localStorage['selectedProjects'] == undefined
          ? "{}"
          : $window.localStorage['selectedProjects'];
      selectedProjects = JSON.parse(selectedProjects);
      if (projectUuid && projectUuid.customer_uuid == currentCustomer) {
        selectedProjects[currentCustomer] = projectUuid.uuid;
        $window.localStorage.setItem('selectedProjects', JSON.stringify(selectedProjects));
      } else {
        for (var key in selectedProjects) {
          if (key == currentCustomer) {
            return selectedProjects[key];
          }
        }
      }
      return null;
    }

    function setProjects(selectedProjects, currentCustomer, projectUuid) {
      selectedProjects[currentCustomer] = projectUuid;
      $window.localStorage.setItem('selectedProjects', JSON.stringify(selectedProjects));
    }

    function removeLastSelectedProject(projectUuid) {
      if ($window.localStorage['selectedProjects']) {
        var projects = JSON.parse($window.localStorage['selectedProjects']);
        for (var customer in projects) {
          if (projects[customer] === projectUuid) {
            setProjects(projects, customer, undefined);
          }
        }
      }
    }

    // XXX: getActiveItem and getBodyClass methods have to be moved to apps.js for code consistency.
    // (We decided, that all URL-depended code have to defined near URLs definition)

    // Active menuItem
    var urlList = {
      appstore: ['appstore.store'],
      dashboard: ['dashboard.index'],
      resources: ['resources.list'],
      projects: ['projects.details', 'projects.create'],
      organizations: ['organizations.list', 'organizations.create', 'organizations.details'],
      services: ['services.list', 'services.create'],
      users: ['users.list', 'users.details', 'profile.details'],
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
