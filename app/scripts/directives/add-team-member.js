'use strict';

(function () {

  angular.module('ncsaas').controller(
    'AddTeamMemberDialogController', AddTeamMemberDialogController);

  AddTeamMemberDialogController.$inject = [
    'currentStateService',
    'customerPermissionsService',
    'projectPermissionsService',
    'projectsService',
    'usersService',
    '$q',
    '$scope'
  ];

  function AddTeamMemberDialogController(
    currentStateService,
    customerPermissionsService,
    projectPermissionsService,
    projectsService,
    usersService,
    $q,
    scope) {
    scope.saveUser = saveUser;
    scope.cancel = cancel;
    scope.addText = 'Add';
    scope.addTitle = 'Add';
    scope.userModel = {};
    scope.errors = {};
    scope.projects = []
    scope.filteredProjects = scope.filteredProjects || [];
    scope.currentUser = null;
    scope.refreshProjectChoices = refreshProjectChoices;
    scope.removeItem = removeItem;

    function loadData() {
      if (scope.editUser) {
        scope.addText = 'Save';
        scope.addTitle = 'Edit';
        scope.userModel.user = scope.editUser;
        scope.userModel.role = scope.editUser.role;
        scope.userModel.projects = [];
        scope.userModel.projectsManagerRole = [];

        scope.editUser.projects && scope.editUser.projects.forEach(function (project) {
          if (project.role === 'Administrator') {
            scope.userModel.projects.push(project);
          } else {
            scope.userModel.projectsManagerRole.push(project);
          }
        });

        return $q.all([usersService.getCurrentUser().then(function (currentUser) {
          scope.canChangeRole = currentUser.is_staff || scope.editUser.uuid !== currentUser.uuid;
        }),
        projectsService.getList().then(function (projects) {
          scope.projects = projects.map(parseProject);
          scope.projects = scope.projects.filter(removeSelectedProjects);
          scope.emptyProjectList = !projects.length;
        })
        ]);
      } else {
        scope.canChangeRole = true;
        return usersService.getAll().then(function (users) {
          scope.users = users.filter(function (user) {
            return scope.addedUsers.indexOf(user.uuid) === -1;
          });
        });
      }
    }

    scope.loading = true;
    loadData().finally(function () {
      scope.loading = false;
    });

    function parseProject(project) {
      return {
        uuid: project.uuid,
        name: project.name,
        url: project.url
      };
    }

    function removeItem(item) {
      scope.projects.push(item);
    }

    refreshProjectChoices();
    function refreshProjectChoices(search) {
      scope.projects = scope.projects.filter(removeSelectedProjects);
      scope.filteredProjects = scope.projects.filter(function(item) {
        return item.name.toLowerCase().indexOf(search) !== -1;
      });
      scope.emptyProjectList = !search && !scope.filteredProjects.length;
    }

    function removeSelectedProjects(project) {
      var roleAdded = false;
      scope.userModel.projects && scope.userModel.projects.forEach(function (item) {
        if (item.uuid === project.uuid) {
          roleAdded = true;
        }
      });
      scope.userModel.projectsManagerRole && scope.userModel.projectsManagerRole.forEach(function (item) {
        if (item.uuid === project.uuid) {
          roleAdded = true;
        }
      });
      return !roleAdded;
    }

    function cancel() {
      scope.$dismiss();
    }

    function saveUser() {
      scope.errors = {};

      if (!scope.userModel.user) {
        scope.errors.user = 'This field is required';
        return $q.reject(scope.errors);
      }

      return $q.all([
        saveCustomerPermission(),
        saveProjectPermissions()
      ]).then(function () {
        scope.$close();
      });
    }

    function saveCustomerPermission() {
      return currentStateService.getCustomer().then(function (currentCustomer) {
        var permission = customerPermissionsService.$create();
        permission.customer = currentCustomer.url;
        permission.user = scope.userModel.user.url;
        permission.role = scope.userModel.role === 'Owner' ? 'owner' : null;

        if (scope.editUser) {
          if (scope.userModel.role !== scope.editUser.role) {
            if (scope.userModel.role !== 'Owner') {
              return customerPermissionsService.deletePermission(scope.editUser.permission);
            } else {
              permission.user = scope.editUser.url;
              return permission.$save();
            }
          }
        } else if (scope.userModel.role === 'Owner') {
          return permission.$save();
        }
      });
    }

    function saveProjectPermissions() {
      var existingProjects = {};
      var currentManagerProjects = {};
      var currentProjects = {};
      scope.userModel.projects = scope.userModel.projects || [];
      scope.userModel.projectsManagerRole = scope.userModel.projectsManagerRole || [];

      if (scope.editUser) {
        existingProjects = (scope.editUser.projects || []).reduce(function (obj, project) {
          obj[project.uuid] = project.permission;
          return obj;
        }, {});
      }

      if (scope.userModel.projects) {
        currentProjects = scope.userModel.projects.reduce(function (obj, project) {
          obj[project.uuid] = true;
          return obj;
        }, {});
      }

      if (scope.userModel.projectsManagerRole) {
        currentManagerProjects = scope.userModel.projectsManagerRole.reduce(function (obj, project) {
          obj[project.uuid] = true;
          return obj;
        }, {});
      }

      var deletedPermissions = [];
      angular.forEach(existingProjects, function (permission, project_uuid) {
        if (!currentProjects[project_uuid] && !currentManagerProjects[project_uuid]) {
          deletedPermissions.push(permission);
        }
      });

      var removalPromises = deletedPermissions.map(function (permission) {
        return projectPermissionsService.deletePermission(permission);
      });

      var addedProjects = [];
      scope.userModel.projects.forEach(function (project) {
        if (!existingProjects[project.uuid]) {
          project.role = 'admin';
          addedProjects.push(project);
        }
      });

      scope.userModel.projectsManagerRole.forEach(function (project) {
        if (!existingProjects[project.uuid]) {
          project.role = 'manager';
          addedProjects.push(project);
        }
      });

      var creationPromises = addedProjects.map(function (project) {
        var instance = projectPermissionsService.$create();
        instance.user = scope.userModel.user.url || scope.editUser.url;
        instance.project = project.url;
        instance.role = project.role;
        return instance.$save();
      });
      return $q.all(creationPromises.concat(removalPromises));
    }
  }
})();
