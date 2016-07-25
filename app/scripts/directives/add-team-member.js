'use strict';

(function() {

    angular.module('ncsaas').controller(
        'AddTeamMemberDialogController', AddTeamMemberDialogController);

    AddTeamMemberDialogController.$inject = [
        'currentStateService',
        'customerPermissionsService',
        'projectPermissionsService',
        'projectsService',
        'usersService',
        '$q',
        '$scope',
    ];

    function AddTeamMemberDialogController(
        currentStateService,
        customerPermissionsService,
        projectPermissionsService,
        projectsService,
        usersService,
        $q,
        scope
    ) {
        scope.add = add;
        scope.cancel = cancel;
        scope.addText = 'Add';
        scope.addTitle = 'Add';
        scope.userModel = {};
        scope.errors = {};
        scope.projectChoices = [];
        scope.currentUser = null;
        scope.currentCustomer = null;
        scope.changeRoleHelpMessage = "You cannot change your own role";
        var editUserRole;

        currentStateService.getCustomer().then(function(response) {
            scope.currentCustomer = response;
        });

        if (scope.editUser) {
            populatePopupModel(scope.editUser);
        }
        scope.$watch('editUser', function(user) {
            if (user) {
                populatePopupModel(user);
            }
        });

        scope.loadingUsers = true;
        usersService.getAll().then(function(users) {
            scope.users = users.filter(function(user) {
                return scope.addedUsers.indexOf(user.uuid) === -1;
            });
            scope.loadingUsers = false;
        });

        getProjectChoices();

        function getProjectChoices() {
            var existingProjects = getAdminedProjects();
            projectsService.getList().then(function(projects) {
                scope.projectChoices = projects.map(function(project) {
                    var permission = existingProjects[project.uuid];
                    return {
                        title: project.name,
                        selected: !!permission,
                        permission: existingProjects[project.uuid],
                        project_url: project.url
                    }
                })
            })
        }

        function getAdminedProjects() {
            var projects = scope.userModel.projects || [];
            return projects.reduce(function(obj, project) {
                obj[project.uuid] = project.permission;
                return obj;
            }, {});
        }

        function populatePopupModel(user) {
            scope.addText = 'Save';
            scope.addTitle = 'Edit';
            scope.userModel.name = user.full_name;
            scope.userModel.user_url = user.url;
            scope.userModel.role = user.role;
            editUserRole = user.role;
            scope.userModel.projects = angular.copy(user.projects);
            usersService.getCurrentUser().then(function(currentUser) {
                scope.currentUser = currentUser;
                scope.changeRole = scope.editUser.uuid === scope.currentUser.uuid;
            });
        }

        function cancel() {
            scope.closeThisDialog();
        }

        function add() {
            scope.errors = {};

            if (!scope.userModel.user_url) {
                scope.errors.user = 'This field is required';
                return $q.reject(scope.errors);
            }

            return $q.all([
                saveCustomerPermission(),
                saveProjectPermissions()
            ]).then(function() {
                scope.closeThisDialog();
            });
        }

        function saveCustomerPermission() {
            var userPermission = customerPermissionsService.$create();
            userPermission.customer = scope.currentCustomer.url;
            userPermission.user = scope.userModel.user_url;
            userPermission.role = scope.userModel.role === 'Owner' ? 'owner' : null;

            if (scope.editUser) {
                if (scope.userModel.role !== editUserRole) {
                    if (scope.userModel.role !== 'Owner') {
                        return customerPermissionsService.deletePermission(scope.editUser.permission);
                    } else {
                        userPermission.user = scope.editUser.url;
                        return userPermission.$save();
                    }
                }
            } else if (scope.userModel.role === 'Owner') {
                return userPermission.$save();
            }
        }

        function saveProjectPermissions() {
            var toRemove = scope.projectChoices.filter(function(choice) {
                return choice.permission && !choice.selected;
            });
            var removalPromises = toRemove.map(function(choice) {
                return projectPermissionsService.deletePermission(choice.permission);
            })
            var toCreate = scope.projectChoices.filter(function(choice) {
                return !choice.permission && choice.selected;
            });
            var creationPromises = toCreate.map(function(choice) {
                var instance = projectPermissionsService.$create();
                var url = scope.userModel.user_url;
                instance.user = url ? url : scope.editUser.url;
                instance.project = choice.project_url;
                instance.role = 'admin';
                return instance.$save();
            })
            return $q.all(removalPromises.concat(creationPromises));
        }
    }
})();
