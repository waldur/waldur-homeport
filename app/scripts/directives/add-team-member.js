'use strict';

(function() {

    angular.module('ncsaas')
        .directive('addTeamMember', [
            'currentStateService',
            'customerPermissionsService',
            'projectPermissionsService',
            'projectsService',
            'usersService',
            '$q',
            '$rootScope',
            addTeamMember]);

    function addTeamMember(
        currentStateService,
        customerPermissionsService,
        projectPermissionsService,
        projectsService,
        usersService,
        $q,
        $rootScope
    ) {
        return {
            restrict: 'E',
            template: '<div class="add-team-member" ng-include="contentUrl"></div>',
            scope: {
                controller: '=',
                editUser: '='
            },
            link: function(scope) {
                scope.contentUrl = 'views/directives/add-team-member.html';
                scope.editUser = null;
                scope.add = add;
                scope.cancel = cancel;
                scope.getProjectsListForAutoComplete = getProjectsListForAutoComplete;
                scope.userSearchInputChanged = userSearchInputChanged;
                scope.selectedUsersCallback = selectedUsersCallback;
                scope.projectRemove = projectRemove;
                scope.addText = 'Add';
                scope.addTitle = 'Add';
                scope.userModel = {};
                scope.errors = {};
                scope.currentUser = null;
                scope.currentCustomer = null;
                scope.changeRoleHelpMessage = "You cannot change your own role";
                var editUserRole;

                currentStateService.getCustomer().then(function(response) {
                    scope.currentCustomer = response;
                });

                usersService.getCurrentUser().then(function(response) {
                    scope.currentUser = response;
                });

                scope.$watch('editUser', function(user) {
                    if (user) {
                        populatePopupModel(user);
                    }
                });

                usersService.getList().then(function(users) {
                    scope.users = users;
                });

                getProjectsListForAutoComplete();

                function populatePopupModel(user) {
                    scope.addText = 'Save';
                    scope.addTitle = 'Edit';
                    scope.userModel.name = user.full_name;
                    scope.userModel.user_url = user.user;
                    scope.userModel.role = user.role;
                    editUserRole = user.role;
                    scope.userModel.projects = angular.copy(user.projects);
                    scope.changeRole = scope.editUser.uuid === scope.currentUser.uuid;
                }

                function add() {
                    scope.errors = {};
                    var userPermission = customerPermissionsService.$create();
                    userPermission.customer = scope.currentCustomer.url;
                    userPermission.user = scope.userModel.user_url;
                    userPermission.role = scope.userModel.role === 'Owner' ? 'owner' : null;

                    if (scope.editUser) {
                        userPermission.user = scope.editUser.url;
                        if (scope.userModel.role !== editUserRole) {
                            if (scope.userModel.role !== 'Owner') {
                                customerPermissionsService.$delete(scope.controller.getPermissionKey(scope.editUser.permission));
                                saveProjectPermissions();
                            } else {
                                saveCustomerPermissions(userPermission);
                            }
                        } else {
                            saveProjectPermissions();
                        }
                        return;
                    }
                    if (!scope.userModel.user_url) {
                        scope.errors.user = 'this field is required';
                        return;
                    }
                    if (scope.userModel.role === 'Owner') {
                        saveCustomerPermissions(userPermission);
                    } else {
                        saveProjectPermissions();
                    }
                }

                function saveCustomerPermissions(userPermission) {
                    userPermission.$save().then(function() {
                        saveProjectPermissions();
                        customerPermissionsService.clearAllCacheForCurrentEndpoint();

                    }, function(error) {
                        console.log('error ', error);
                    });
                }

                function saveProjectPermissions() {
                    if (scope.projectsToDelete) {
                        var promisesDelete = [];
                        scope.projectsToDelete.forEach(function(project) {
                            var promise = projectPermissionsService.$delete(scope.controller.getPermissionKey(project.permission));
                            promisesDelete.push(promise);
                        });
                        $q.all(promisesDelete).then(function() {
                            clearAndRefreshList();
                        });
                    }
                    if (scope.userModel.projects) {
                        var promises = [];
                        scope.userModel.projects.forEach(function(item) {
                            var instance = projectPermissionsService.$create();
                            var url = scope.userModel.user_url;
                            instance.user = url ? url : scope.editUser.url;
                            instance.project = item.url;
                            instance.role = 'admin';
                            if (!item.permission) {
                                var promise = instance.$save();
                                promises.push(promise);
                            }
                        });
                        $q.all(promises).then(function() {
                            clearAndRefreshList()
                        });
                    } else {
                        clearAndRefreshList();
                    }
                }

                function clearAndRefreshList() {
                    scope.addText = 'Add';
                    scope.addTitle = 'Add';
                    scope.userModel = {};
                    scope.errors = {};
                    scope.controller.entityOptions.entityData.showPopup = false;
                    scope.editUser = null;
                    scope.projectsToDelete = null;
                    scope.changeRole = false;
                    editUserRole = null;
                    $rootScope.$broadcast('reloadList');
                    $rootScope.$broadcast('actionButton:close');
                }

                function cancel() {
                    scope.addText = 'Add';
                    scope.addTitle = 'Add';
                    if (scope.projectsToDelete) {
                        scope.projectsToDelete.forEach(function(item) {
                            scope.userModel.projects.push(item);
                        });
                    }
                    scope.userModel = {};
                    scope.errors = {};
                    scope.controller.entityOptions.entityData.showPopup = false;
                    scope.editUser = null;
                    scope.projectsToDelete = null;
                    scope.changeRole = false;
                    editUserRole = null;
                    $rootScope.$broadcast('actionButton:close');
                }

                function getProjectsListForAutoComplete(filter) {
                    filter = filter || {};
                    filter['DONTBLOCK'] = 1;
                    projectsService.getList(filter).then(function(projects) {
                        scope.projectsListForAutoComplete = projects.map(function(item) {
                            item.project_name = item.name;
                            return item;
                        });

                        scope.userModel.projects && scope.userModel.projects.forEach(function(item) {
                            scope.projectsListForAutoComplete.forEach(function(item2, i, arr) {
                                if (item.uuid === item2.uuid) {
                                    arr.splice(i, 1);
                                }
                            });
                        });
                    });
                }

                function userSearchInputChanged(searchText) {
                    scope.getProjectsListForAutoComplete({name: searchText});
                }

                function selectedUsersCallback(selected) {
                    !scope.userModel.projects && (scope.userModel.projects = []);
                    if (selected) {
                        var isPresent = null;
                        scope.userModel.projects.forEach(function(project) {
                            if (project.uuid === selected.originalObject.uuid) {
                                isPresent = true;
                            }
                        });
                        !isPresent && scope.userModel.projects.push(selected.originalObject);
                    }
                }

                function projectRemove(project) {
                    scope.projectsToDelete = scope.projectsToDelete || [];
                    var index = scope.userModel.projects.indexOf(project);
                    scope.projectsToDelete.push(scope.userModel.projects[index]);
                    scope.userModel.projects.splice(index, 1);
                }

                scope.$on('populatePopupModel', function(event, user) {
                    scope.editUser = user;
                    user && populatePopupModel(user);
                });

                scope.ignoreAddedUsers = function(user) {
                    if (user && scope.controller.list.length) {
                        for (var i = 0; i < scope.controller.list.length; i++) {
                            if (user.uuid === scope.controller.list[i].uuid) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return true;
                };
            }
        };
    }

})();
