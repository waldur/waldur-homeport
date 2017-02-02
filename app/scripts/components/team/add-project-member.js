import template from './add-project-member.html';

const addProjectMember = {
  template,
  bindings: {
    close: '&',
    resolve: '<'
  },
  controller: class AddProjectMemberDialogController {
    constructor(projectPermissionsService, customersService, blockUI, $q, ENV, ncUtils) {
      // @ngInject
      this.$q = $q;
      this.projectPermissionsService = projectPermissionsService;
      this.customersService = customersService;
      this.blockUI = blockUI;
      this.ENV = ENV;
      this.ncUtils = ncUtils;
    }

    $onInit() {
      var roles = this.ENV.roles;
      this.addText = 'Add';
      this.addTitle = 'Add';
      this.projectModel = {
        role: null,
        expiration_time: null
      };

      this.possibleRoles = [
        { name: roles.manager, value: 'manager' },
        { name: roles.admin, value: 'admin' }
      ];
      this.datetime = {
        name: 'expiration_time',
        options: {
          format: 'dd.MM.yyyy',
          altInputFormats: ['M!/d!/yyyy'],
          dateOptions: {
            minDate: moment().add(1, 'days').toDate(),
            startingDay: 1
          }
        }
      };

      this.loading = true;
      var vm = this;
      this.loadData().finally(function() {
        vm.loading = false;
      });
    }

    loadData() {
      var vm = this;
      this.projectModel.role = 'admin';

      if (this.resolve.editUser) {
        this.addText = 'Save';
        this.addTitle = 'Edit';
        this.projectModel.user = this.resolve.editUser;
        this.projectModel.role = this.resolve.editUser.role;
        this.projectModel.expiration_time = this.resolve.editUser.expiration_time ?
          new Date(this.resolve.editUser.expiration_time) :
          null;
        return this.$q.resolve();
      } else {
        return this.customersService.getAll({
          operation: 'users', UUID: vm.resolve.currentCustomer.uuid
        }).then(function(users) {
          vm.users = users.filter(function(user) {
            return vm.resolve.addedUsers.indexOf(user.uuid) === -1;
          });
        });
      }
    }

    saveUser() {
      this.errors = [];
      var vm = this;
      var block = this.blockUI.instances.get('add-team-member-dialog');
      block.start({delay: 0});

      return this.saveProjectPermissions()
        .then(function() {
          block.stop();
          vm.close();
        }, function(error) {
          block.stop();
          vm.errors = this.ncUtils.responseErrorFormatter(error);
        });
    }

    saveProjectPermissions() {
      if (this.resolve.editUser && (this.resolve.editUser.role !== this.projectModel.role ||
        this.resolve.editUser.expiration_time !== this.projectModel.expiration_time)) {
        return this.checkPermissionAction();
      } else if (this.resolve.editUser && (this.resolve.editUser.role === this.projectModel.role ||
        this.resolve.editUser.expiration_time === this.projectModel.expiration_time)) {
        return this.$q.resolve();
      } else if (!this.resolve.editUser) {
        return this.createPermission(this.projectModel.role);
      }
    }

    checkPermissionAction() {
      var vm = this;
      if (this.resolve.editUser.expiration_time !== this.projectModel.expiration_time &&
        this.resolve.editUser.role === this.projectModel.role) {
        return this.updatePermission(this.resolve.editUser.permission);
      }
      return this.projectPermissionsService.deletePermission(this.resolve.editUser.permission).then(function() {
        return vm.createPermission(vm.projectModel.role);
      });
    }

    updatePermission(permission) {
      var model = {};
      model.user = this.projectModel.user.url;
      model.role = this.projectModel.role;
      model.expiration_time = this.projectModel.expiration_time;
      model.project = this.resolve.currentProject.url;
      model.url = permission;
      return this.projectPermissionsService.update(model);
    }

    createPermission(role) {
      var instance = this.projectPermissionsService.$create();
      instance.user = this.projectModel.user.url;
      instance.project = this.resolve.currentProject.url;
      instance.expiration_time = this.projectModel.expiration_time;
      instance.role = role;
      return instance.$save();
    }
  }
};

export default addProjectMember;
