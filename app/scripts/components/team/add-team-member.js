import template from './add-team-member.html';

export default function addTeamMember() {
  return {
    restrict: 'E',
    template: template,
    controller: AddTeamMemberDialogController
  };
}

// @ngInject
function AddTeamMemberDialogController(
  customerPermissionsService,
  projectPermissionsService,
  customersService,
  blockUI,
  $q,
  $scope,
  ENV) {
  $scope.roles = ENV.roles;
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

  init();

  function init() {
    $scope.addText = 'Save';
    $scope.addTitle = 'Edit';
    $scope.userModel.user = $scope.editUser;
    $scope.userModel.role = $scope.editUser.role;

    $scope.editUser.projects.forEach(function(project) {
      if (project.role === 'admin') {
        $scope.userModel.projectsAdminRole.push(project);
      } else {
        $scope.userModel.projectsManagerRole.push(project);
      }
    });
    $scope.canChangeRole = $scope.currentUser.is_staff || $scope.editUser.uuid !== $scope.currentUser.uuid;
    refreshProjectChoices();
  }

  function pushBackToProjectsList(item) {
    $scope.projects.push(item);
  }

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
    permission.role = $scope.userModel.role === 'owner' ? 'owner' : null;

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
    var originalPermissions = {};
    var originalRoles = {};
    if ($scope.editUser) {
      angular.forEach($scope.editUser.projects, function(project) {
        originalPermissions[project.uuid] = project.permission;
      });

      angular.forEach($scope.editUser.projects, function(project) {
        originalRoles[project.uuid] = project.role;
      });
    }

    var newRoles = {};
    var newProjects = {};
    angular.forEach($scope.userModel.projectsManagerRole, function(project) {
      newRoles[project.uuid] = 'manager';
      newProjects[project.uuid] = project.url;
    });
    angular.forEach($scope.userModel.projectsAdminRole, function(project) {
      newRoles[project.uuid] = 'admin';
      newProjects[project.uuid] = project.url;
    });

    var createdProjects = [];
    angular.forEach(newRoles, function(role, project) {
      if (!originalPermissions[project] || (originalRoles[project] !== role)) {
        createdProjects.push(project);
      }
    });

    var creationPromises = createdProjects.map(function(project) {
      var instance = projectPermissionsService.$create();
      instance.user = $scope.userModel.user.url || $scope.editUser.url;
      instance.project = newProjects[project];
      instance.role = newRoles[project];
      return instance.$save();
    });

    var deletedPermissions = [];
    angular.forEach(originalRoles, function(role, project) {
      if (!newRoles[project] || (newRoles[project] !== role)) {
        deletedPermissions.push(originalPermissions[project]);
      }
    });

    var removalPromises = deletedPermissions.map(function(permission) {
      return projectPermissionsService.deletePermission(permission);
    });

    return $q.all(creationPromises.concat(removalPromises));
  }
}
