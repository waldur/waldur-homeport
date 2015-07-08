'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      'baseControllerListClass',
      'usersService',
      'projectPermissionsService',
      '$rootScope',
      'ENTITYLISTFIELDTYPES',
      UserListController
    ]);

  function UserListController(baseControllerListClass, usersService, projectPermissionsService, $rootScope, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var UserController = baseControllerListClass.extend({
      userProjects: {},

      init:function() {
        this.service = usersService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'full_name';
        this.searchFilters = [
          {
            name: 'potential',
            title: 'Colleagues',
            value: true
          }
        ];
        this.actionButtonsListItems = [
          {
            title: 'User action placeholder',
            clickFunction: function(user) {}
          }
        ];
        this.expandableOptions = [
          {
            isList: true,
            sectionTitle: 'Connected projects',
            articleBlockText: 'Manage users through',
            entitiesLinkRef: 'projects.list',
            entitiesLinkText: 'project details',
            addItemBlock: true,
            listKey: 'userProjects',
            minipaginationData:
            {
              pageModels: 'userProjects',
              pageModelId: 'username',
              pageChange: 'getProjectsForUser',
              pageEntityName: 'projects'
            },
            list: [
              {
                entityDetailsLink: 'projects.details({uuid: element.project_uuid})',
                entityDetailsLinkText: 'project_name',
                type: 'link'
              }
            ]
          }
        ];
        this.entityOptions = {
          entityData: {
            title: 'Users',
            noDataText: 'No users yet.',
            hideActionButtons: true
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.avatarPictureField,
              className: 'avatar',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Name',
              propertyName: 'full_name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'users.details({uuid: entity.uuid})',
              className: 'name',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Email',
              propertyName: 'email',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Username',
              propertyName: 'username',
              type: ENTITYLISTFIELDTYPES.noType
            }
          ]
        };
      },
      showMore: function(user) {
        if (!this.userProjects[user.username]) {
          this.getProjectsForUser(user.username);
        }
      },
      getProjectsForUser: function(username, page) {
        var vm = this;
        var filter = {
          username:username
        };
        vm.userProjects[username] = {data:null};
        page = page || 1;
        projectPermissionsService.page = page;
        projectPermissionsService.pageSize = 5;
        vm.userProjects[username].page = page;
        projectPermissionsService.filterByCustomer = false;
        projectPermissionsService.getList(filter).then(function(response) {
          vm.userProjects[username].data = response;
          vm.userProjects[username].pages = projectPermissionsService.pages;
          $rootScope.$broadcast('mini-pagination:getNumberList', vm.userProjects[username].pages,
            page, vm.getProjectsForUser.bind(vm), 'projects', username);
        });
      }
    });

    controllerScope.__proto__ = new UserController();
  }

  angular.module('ncsaas')
    .service('baseUserDetailUpdateController', [
      'baseControllerDetailUpdateClass',
      'usersService',
      'authService',
      '$translate',
      'LANGUAGE',
      baseUserDetailUpdateController
    ]);

  // need for profile page
  function baseUserDetailUpdateController(
    baseControllerDetailUpdateClass, usersService, authService, $translate, LANGUAGE) {
    var ControllerClass = baseControllerDetailUpdateClass.extend({
      activeTab: 'eventlog',
      currentUser: null,

      init: function() {
        this.service = usersService;
        this.getCurrentUser();
        this._super();
        this.LANGUAGE_CHOICES = LANGUAGE.CHOICES;
        this.selectedLanguage = $translate.use();
      },
      getCurrentUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.currentUser = response;
        });
      },
      deleteAccount: function() {
        if (confirm('Are you sure you want to delete account?')) {
          this.model.$delete(
            authService.signout,
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      },
      changeLanguage: function() {
        $translate.use(this.selectedLanguage);
      }
    });

    return ControllerClass;
  }

  angular.module('ncsaas')
    .controller('UserDetailUpdateController', [
      'baseUserDetailUpdateController',
      UserDetailUpdateController
    ]);

  function UserDetailUpdateController(baseUserDetailUpdateController) {
    var controllerScope = this;
    var Controller = baseUserDetailUpdateController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'organizations.details';
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('UserEventTabController', [
      '$stateParams',
      'usersService',
      'baseEventListController',
      UserEventTabController
    ]);

  function UserEventTabController($stateParams, usersService, baseEventListController) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      user: null,

      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        this.getUser();
      },
      getList: function(filter) {
        if (this.user) {
          this.service.defaultFilter.search = this.user.full_name;
          this._super(filter);
        }
      },
      getUser: function() {
        var vm = this;
        if ($stateParams.uuid) {
          usersService.$get($stateParams.uuid).then(function (response) {
            vm.user = response;
            vm.getList();
          });
        } else {
          usersService.getCurrentUser().then(function(response) {
            vm.user = response;
            vm.getList();
          });
        }
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('UserProjectTabController', [
      '$stateParams',
      'usersService',
      'baseControllerListClass',
      'projectPermissionsService',
      UserProjectTabController
    ]);

  function UserProjectTabController($stateParams, usersService, baseControllerListClass, projectPermissionsService) {
    var controllerScope = this;
    var ProjectController = baseControllerListClass.extend({
      user: null,

      init: function() {
        this.controllerScope = controllerScope;
        this.service = projectPermissionsService;
        this._super();
        this.getUser();
      },
      getList: function(filter) {
        if (this.user) {
          this.service.defaultFilter.username = this.user.username;
          this._super(filter);
        }
      },
      getUser: function() {
        var vm = this;
        if ($stateParams.uuid) {
          usersService.$get($stateParams.uuid).then(function (response) {
            vm.user = response;
            vm.getList();
          });
        } else {
          usersService.getCurrentUser().then(function(response) {
            vm.user = response;
            vm.getList();
          });
        }
      }
    });

    controllerScope.__proto__ = new ProjectController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('UserKeyTabController', [
      '$stateParams',
      'keysService',
      'baseControllerListClass',
      'usersService',
      UserKeyTabController
    ]);

  function UserKeyTabController($stateParams, keysService, baseControllerListClass, usersService) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      user: {},

      init: function() {
        this.controllerScope = controllerScope;
        this.service = keysService;
        if ($stateParams.uuid) {
          this.user.uuid = $stateParams.uuid;
        } else {
          this.getCurrentUser();
        }
        this._super();
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(controllerScope)
          }
        ];
      },
      getList: function(filter) {
        if (this.user.uuid) {
          this.service.defaultFilter.user_uuid = this.user.uuid;
          this._super(filter);
        }
      },
      getCurrentUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.user = response;
          vm.getList();
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();