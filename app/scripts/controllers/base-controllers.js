'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', [
      '$rootScope', '$scope', '$state', 'currentStateService', 'customersService',
      'usersService', 'ENV', 'baseControllerClass', '$translate', 'LANGUAGE', '$window', 'projectsService', '$q', 'blockUI',
      HeaderController]);

  function HeaderController(
    $rootScope, $scope, $state, currentStateService, customersService, usersService,
    ENV, baseControllerClass, $translate, LANGUAGE, $window, projectsService, $q, blockUI) {
    var controllerScope = this;
    var HeaderControllerClass = baseControllerClass.extend({
      customers: [],
      currentUser: {},
      currentCustomer: {},
      projects: [],
      currentProject: {},
      showImport: ENV.showImport,
      menuState: {
        addSomethingMenu: false,
        customerMenu: false,
        profileMenu: false,
        LangMenu: false
      },

      init: function() {
        this.activate();
        this.menuItemActive = currentStateService.getActiveItem($state.current.name);
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(controllerScope));
        this.setSignalHandler('refreshProjectList', this.refreshProjectListHandler.bind(controllerScope));
        this.setSignalHandler('refreshCustomerList', this.refreshCustomerListHandler.bind(controllerScope));
        this._super();
      },
      activate: function() {
        var vm = this;
        // XXX: for top menu customers viewing
        customersService.pageSize = ENV.topMenuCustomersCount;
        customersService.cacheTime = ENV.topMenuCustomersCacheTime;
        customersService.getList().then(function(response) {
          vm.customers = response;
        });
        // reset pageSize
        customersService.pageSize = ENV.pageSize;

        vm.getProjectList();

        // initiate current user
        usersService.getCurrentUser().then(function(response) {
          vm.currentUser = response;
        });

        // initiate current customer
        currentStateService.getCustomer().then(function(customer) {
          vm.currentCustomer = customer;
        });

        currentStateService.getProject().then(function(project) {
          vm.currentProject = project;
        });

        $rootScope.closeMenu = vm.closeMenu;

        this.LANGUAGE_CHOICES = LANGUAGE.CHOICES;
        this.currentLanguage = this.findLanguageByCode($translate.use());
      },

      changeLanguage: function(language) {
        this.currentLanguage = language;
        $translate.use(this.currentLanguage.code);
      },

      findLanguageByCode: function(code) {
        for (var i=0; i<LANGUAGE.CHOICES.length; i++) {
          if (LANGUAGE.CHOICES[i].code == code) {
            return LANGUAGE.CHOICES[i];
          }
        }
      },

      closeMenu: function() {
        var vm = controllerScope;
        for (var property in vm.menuState) {
          if (vm.menuState.hasOwnProperty(property)) {
            vm.menuState[property] = false;
          }
        }
        $rootScope.$broadcast('clicked-out');
      },
      setCurrentCustomer: function(customer) {
        var vm = this;
        currentStateService.setCustomer(customer);
        vm.currentCustomer = customer;
        $rootScope.$broadcast('currentCustomerUpdated');
      },
      setCurrentProject: function(project) {
        var vm = this;
        this.handleSelectedProjects(project);
        currentStateService.setProject(project);
        vm.currentProject = project;
        $rootScope.$broadcast('currentProjectUpdated');
      },
      menuToggle: function(active, event) {
        var vm = this;
        for (var property in vm.menuState) {
          if (vm.menuState.hasOwnProperty(property)) {
            if (property !== active) {
              vm.menuState[property] = false;
            }
          }
        }
        event.stopPropagation();
        vm.menuState[active] = !vm.menuState[active];
      },
      handleSelectedProjects: function(projectUuid) {
        var vm = this,
          selectedProjects = $window.localStorage['selectedProjects'] == undefined
            ? "{}"
            : $window.localStorage['selectedProjects'];
        selectedProjects = JSON.parse(selectedProjects);
        if (projectUuid) {
          selectedProjects[vm.currentCustomer.uuid] = projectUuid.uuid;
          $window.localStorage.setItem('selectedProjects', JSON.stringify(selectedProjects));
        } else {
          for (var key in selectedProjects) {
            if (key == vm.currentCustomer.uuid) {
              return selectedProjects[key];
            }
          }
        }
        return null;
      },

      mobileMenu: function() {
        this.showMobileMenu = !this.showMobileMenu;
      },
      currentCustomerUpdatedHandler: function() {
        var vm = this;
        this.getProjectList().then(function(response) {
          if($window.localStorage[ENV.currentProjectUuidStorageKey]) {
            var uuids = response.map(function(project) {
              return project.uuid;
            });
            if (!uuids.indexOf($window.localStorage[ENV.currentProjectUuidStorageKey]) + 1) {
              vm.setFirstOrLastSelectedProject();
            }
          } else {
            vm.setFirstOrLastSelectedProject();
          }
        });
      },
      setFirstOrLastSelectedProject: function() {
        var vm = this;

        var projectUuid = vm.handleSelectedProjects();
        if (projectUuid) {
          projectsService.$get(projectUuid).then(function(project){
            currentStateService.setProject(project);
            vm.currentProject = project;
          });
        } else {
          projectsService.getFirst().then(function(firstProject) {
            vm.setCurrentProject(firstProject);
          });
        }
      },
      refreshProjectListHandler: function(event, params) {
        var vm = this,
          projectUuids,
          currentProjectKey,
          model;
        if (params) {
          model = params.model;
          projectUuids = vm.projects.map(function(obj) {
            return obj.uuid;
          });
          currentProjectKey = projectUuids.indexOf(model.uuid);
          if (params.update) {
            if (currentProjectKey + 1) {
              vm.projects[currentProjectKey] = model;
            }
            if (model.uuid == vm.currentProject.uuid) {
              vm.currentProject = model;
              vm.setCurrentProject(model);
            }
          }
          if (params.new) {
            vm.projects.push(model);
          }
          if (params.remove) {
            if (currentProjectKey + 1) {
              vm.projects.splice(currentProjectKey, 1);
            }
            if (model.uuid == vm.currentProject.uuid) {
              vm.setFirstOrLastSelectedProject();
            }
          }
          projectsService.cacheReset = true;
        } else {
          vm.setFirstOrLastSelectedProject();
          vm.getProjectList(true);
        }
      },
      refreshCustomerListHandler: function(event, params) {
        var vm = this,
          customerUuids,
          key,
          model = params.model;
        customerUuids = vm.customers.map(function(obj) {
          return obj.uuid;
        });
        key = customerUuids.indexOf(model.uuid);
        if (key + 1) {
          vm.customers[key].name = model.name;
          if (vm.currentCustomer) {
            if (model.uuid == vm.currentCustomer.uuid) {
              if (params.update) {
                vm.currentCustomer = model;
                vm.setCurrentCustomer(model);
                vm.customers[key] = model;
                customersService.cacheReset = true;
              } else {
                vm.setFirstCustomer();
                vm.getCustomerList(true);
              }
            }
          } else {
            vm.getCustomerList(true);
            currentStateService.getCustomer().then(function(currentCustomer) {
              if (model.uuid == currentCustomer.uuid) {
                vm.setFirstCustomer();
              }
            });
          }
        }
      },
      setFirstCustomer: function() {
        var vm = this;
        customersService.getFirst().then(function(firstCustomer) {
          vm.setCurrentCustomer(firstCustomer);
        });
      },
      getProjectList: function(cacheReset) {
        var vm = this,
          deferred = $q.defer();
        projectsService.cacheTime = ENV.topMenuProjectsCacheTime;
        projectsService.cacheReset = cacheReset;
        var projectMenu = blockUI.instances.get('project-menu');
        projectMenu.start();
        projectsService.getList().then(function(response) {
          vm.projects = response;
          projectMenu.stop();
          deferred.resolve(response);
        });

        return deferred.promise;
      },
      getCustomerList: function(cacheReset) {
        var vm = this,
          deferred = $q.defer();
        customersService.cacheTime = ENV.topMenuCustomerCacheTime;
        customersService.cacheReset = cacheReset;
        var customerMenu = blockUI.instances.get('customer-menu');
        customerMenu.start();
        customersService.getList().then(function(response) {
          vm.customers = response;
          customerMenu.stop();
          deferred.resolve(response);
        });

        return deferred.promise;
      }
    });

    controllerScope.__proto__ = new HeaderControllerClass();
  }

  angular.module('ncsaas')
    .controller('MainController', [
      '$q', '$rootScope', '$state', 'authService', 'currentStateService', 'customersService', 'usersService',
      'baseControllerClass', '$window', 'ENV', 'projectsService', MainController]);

  function MainController(
    $q, $rootScope, $state, authService, currentStateService, customersService, usersService, baseControllerClass,
    $window, ENV, projectsService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({

      init: function() {
        this.setSignalHandler('$stateChangeSuccess', this.stateChangeSuccessHandler.bind(controllerScope));
        this._super();
        $rootScope.buildId = ENV.buildId;
        $rootScope.logout = this.logout;
      },
      logout: function() {
        authService.signout();
        currentStateService.isCustomerDefined = false;
        $state.go('home.login');
      },
      stateChangeSuccessHandler: function(event, toState) {
        this.deregisterEvent('currentCustomerUpdated'); // clear currentCustomerUpdated event handlers
        this.deregisterEvent('refreshProjectList'); // clear refreshProjectList event handlers
        $rootScope.bodyClass = currentStateService.getBodyClass(toState.name);
        // if user is authenticated - he should have selected customer
        if (authService.isAuthenticated() && !currentStateService.isCustomerDefined) {
          var deferred = $q.defer(),
            projectDeferred = $q.defer();
          usersService.getCurrentUser().then(function(user) {
            var date  = new Date(user.date_joined).getTime();
            window.Intercom('boot', {
              app_id: ENV.IntercomAppId,
              name: user.full_name,
              email: user.email,
              created_at: date
            });
            if($window.localStorage[ENV.currentCustomerUuidStorageKey]) {
              customersService.$get($window.localStorage[ENV.currentCustomerUuidStorageKey]).then(function(customer) {
                deferred.resolve(customer);
                getProject()
              }, setPersonalOrFirstCustomer);
            } else {
              setPersonalOrFirstCustomer();
            }

            function setPersonalOrFirstCustomer() {
              customersService.getPersonalOrFirstCustomer(user.username).then(function(customer) {
                deferred.resolve(customer);
                getProject()
              });
            }
          });
          currentStateService.setCustomer(deferred.promise);
          currentStateService.setProject(projectDeferred.promise);
        }

        function getProject() {
          if ($window.localStorage[ENV.currentProjectUuidStorageKey]) {
            projectsService.$get($window.localStorage[ENV.currentProjectUuidStorageKey]).then(function(response) {
              currentStateService.getCustomer().then(function(customer) {
                if (response.customer_uuid == customer.uuid) {
                  projectDeferred.resolve(response);
                } else {
                  getFirstProject();
                }
              });
            }, getFirstProject);
          } else {
            getFirstProject();
          }
          function getFirstProject() {
            projectsService.getFirst().then(function(response) {
              projectDeferred.resolve(response);
            });
          }
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

