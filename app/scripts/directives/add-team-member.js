'use strict';

(function() {

  angular.module('ncsaas').controller(
    'AddTeamMemberDialogController', AddTeamMemberDialogController);

  AddTeamMemberDialogController.$inject = [
    'customerPermissionsService',
    'projectPermissionsService',
    'usersService',
    'blockUI',
    '$q',
    '$scope'
  ];

  function AddTeamMemberDialogController(
    customerPermissionsService,
    projectPermissionsService,
    usersService,
    blockUI,
    $q,
    $scope) {
    $scope.saveUser = saveUser;
    $scope.addText = 'Add';
    $scope.addTitle = 'Add';
    $scope.userModel = {
      projectsAdminRole: [],
      projectsManagerRole: []
    };
    $scope.errors = {};
    $scope.projects = [];
    $scope.refreshProjectChoices = refreshProjectChoices;
    $scope.pushBackToProjectsList = pushBackToProjectsList;
    $scope.validateSubmit = validateSubmit;
    $scope.projects = $scope.currentCustomer.projects.filter(removeSelectedProjects);
    $scope.emptyProjectList = !$scope.projects.length;

    function loadData() {
      if ($scope.editUser) {
        $scope.addText = 'Save';
        $scope.addTitle = 'Edit';
        $scope.userModel.user = $scope.editUser;
        $scope.userModel.role = $scope.editUser.role;

        $scope.editUser.projects.forEach(function(project) {
          if (project.role === 'Administrator') {
            $scope.userModel.projectsAdminRole.push(project);
          } else {
            $scope.userModel.projectsManagerRole.push(project);
          }
        });
        $scope.canChangeRole = $scope.currentUser.is_staff || $scope.editUser.uuid !== $scope.currentUser.uuid;
        return $q.resolve();
      } else {
        $scope.canChangeRole = true;
        return usersService.getAll().then(function(users) {
          $scope.users = users.filter(function(user) {
            return $scope.addedUsers.indexOf(user.uuid) === -1;
          });
        });
      }
    }

    $scope.loading = true;
    loadData().finally(function() {
      $scope.loading = false;
    });

    function pushBackToProjectsList(item) {
      $scope.projects.push(item);
    }

    refreshProjectChoices();
    function refreshProjectChoices() {
      $scope.projects = $scope.projects.filter(removeSelectedProjects);
    }

    function removeSelectedProjects(project) {
      var roleAdded = false,
        i,
        j;
      for (i = 0; i < $scope.userModel.projectsAdminRole.length; i++) {
        if ($scope.userModel.projectsAdminRole[i].uuid === project.uuid) {
          roleAdded = true;
          break;
        }
      }
      for (j = 0; j < $scope.userModel.projectsManagerRole.length; j++) {
        if ($scope.userModel.projectsManagerRole[j].uuid === project.uuid) {
          roleAdded = true;
          break;
        }
      }
      return !roleAdded;
    }

    function saveUser() {
      $scope.errors = {};
      var block = blockUI.instances.get('add-team-member-dialog');
      block.start({delay: 0});

      return $q.all([
        saveCustomerPermission(),
        saveProjectPermissions()
      ]).then(function() {
        block.stop();
        $scope.$close();
      }, function(error) {
        block.stop();
        $scope.errors = error.data;
      });
    }

    function validateSubmit() {
      return (!$scope.editUser && !$scope.userModel.user) ||
        (!$scope.userModel.role && !$scope.userModel.projectsAdminRole.length &&
        !$scope.userModel.projectsManagerRole.length);
    }

    function saveCustomerPermission() {
      var permission = customerPermissionsService.$create();
      permission.customer = $scope.currentCustomer.url;
      permission.user = $scope.userModel.user.url;
      permission.role = $scope.userModel.role === 'Owner' ? 'owner' : null;

      if ($scope.editUser) {
        if ($scope.userModel.role !== $scope.editUser.role) {
          if (!$scope.userModel.role) {
            return customerPermissionsService.deletePermission($scope.editUser.permission);
          } else {
            permission.user = $scope.editUser.url;
            return permission.$save();
          }
        }
      } else if ($scope.userModel.role) {
        return permission.$save();
      }
    }

    function saveProjectPermissions() {
      var deletedPermissions = [];
      var addedProjects;
      var removalPromises;
      var managerProjects = $scope.userModel.projectsManagerRole.map(function(item) {
        item.role = 'manager';
        return item;
      });
      var adminProjects = $scope.userModel.projectsAdminRole.map(function(item) {
        item.role = 'admin';
        return item;
      });
      var allFormProjects = managerProjects.concat(adminProjects);

      if ($scope.editUser) {
        deletedPermissions = deletedProjectPermissions(allFormProjects);
        removalPromises = deletedPermissions.map(function(permission) {
          return projectPermissionsService.deletePermission(permission);
        });
        addedProjects = updatedProjectPermissions(allFormProjects);
      } else {
        addedProjects = allFormProjects;
      }

      var creationPromises = addedProjects.map(function(project) {
        var instance = projectPermissionsService.$create();
        instance.user = $scope.userModel.user.url || $scope.editUser.url;
        instance.project = project.url;
        instance.role = project.role;
        return instance.$save();
      });

      return $q.all(creationPromises.concat(removalPromises));
    }

    function deletedProjectPermissions(allFormProjects) {
      var deletedPermissions = [];
      angular.forEach($scope.editUser.projects, function(project) {
        var found = false;
        for (var i = 0; i < allFormProjects.length; i++) {
          if (project.uuid === allFormProjects[i].uuid) {
            found = true;
            break;
          }
        }
        if (!found) {
          deletedPermissions.push(project.permission);
        }
      });
      return deletedPermissions;
    }

    function updatedProjectPermissions(allFormProjects) {
      return allFormProjects.filter(function(projectItem) {
        for (var i = 0; i < $scope.editUser.projects.length; i++) {
          if (projectItem.uuid === $scope.editUser.projects[i].uuid) {
            return false;
          }
        }
        return true;
      });
    }
  }
})();
