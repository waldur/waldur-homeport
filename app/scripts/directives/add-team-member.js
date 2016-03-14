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
            addTeamMember]);

    function addTeamMember(
        currentStateService,
        customerPermissionsService,
        projectPermissionsService,
        projectsService,
        usersService,
        $q
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
                scope.currentUser = null;
                var currentCustomer;

                currentStateService.getCustomer().then(function(response) {
                    currentCustomer = response;
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
                    scope.userModel.name = user.user_full_name;
                    scope.userModel.user_url = user.user;
                    scope.userModel.role = user.role;
                    scope.userModel.projects = user.projectsAccessible;

                }

                function add() {
                    var userPermission = customerPermissionsService.$create();
                    if (scope.editUser) {
                        userPermission = scope.editUser;
                        userPermission.role = scope.userModel.role;
                        if (scope.userModel.role !== 'owner' &&
                            scope.editUser.user_uuid !== scope.currentUser.uuid) {
                            customerPermissionsService.$delete(scope.editUser.pk).then(function() {
                                saveCustomerPermissions(userPermission);
                            });
                        } else {
                            saveProjectPermissions();
                        }
                        return;
                    }
                    userPermission.customer = currentCustomer.url;
                    userPermission.user = scope.userModel.user_url;
                    userPermission.role = scope.userModel.role;
                    saveCustomerPermissions(userPermission);
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
                            var promise = projectPermissionsService.$delete(project.pk);
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
                            instance.user = scope.userModel.user_url;
                            instance.project = item.url;
                            instance.role = 'admin';
                            var promise = instance.$save();
                            promises.push(promise);
                        });
                        $q.all(promises).then(function() {
                            clearAndRefreshList()
                        });
                    } else {
                        clearAndRefreshList();
                    }
                }

                function clearAndRefreshList() {
                    scope.userModel = {};
                    scope.controller.entityOptions.entityData.showPopup = false;
                    scope.editUser = null;
                    scope.projectsToDelete = null;
                    scope.controller.getList();
                }

                function cancel() {
                    if (scope.projectsToDelete) {
                        scope.projectsToDelete.forEach(function(item) {
                            scope.userModel.projects.push(item);
                        });
                    }
                    scope.userModel = {};
                    scope.controller.entityOptions.entityData.showPopup = false;
                    scope.editUser = null;
                    scope.projectsToDelete = null;
                }

                function getProjectsListForAutoComplete(filter) {
                    filter = filter || {};
                    filter['DONTBLOCK'] = 1;
                    projectsService.getList(filter).then(function(projects) {
                        scope.projectsListForAutoComplete = projects.map(function(item) {
                            item.project_name = item.name;
                            return item;
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
                })
            }
        };
    }

})();
