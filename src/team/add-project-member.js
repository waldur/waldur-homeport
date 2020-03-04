import template from './add-project-member.html';

const addProjectMember = {
  template,
  bindings: {
    close: '&',
    resolve: '<',
  },
  controller: class AddProjectMemberDialogController {
    // @ngInject
    constructor(
      projectPermissionsService,
      customersService,
      $q,
      ENV,
      ErrorMessageFormatter,
    ) {
      this.$q = $q;
      this.projectPermissionsService = projectPermissionsService;
      this.customersService = customersService;
      this.ENV = ENV;
      this.ErrorMessageFormatter = ErrorMessageFormatter;
    }

    $onInit() {
      let roles = this.ENV.roles;
      this.addText = gettext('Add');
      this.addTitle = gettext('Add project member');
      this.projectModel = {
        role: null,
        expiration_time: null,
      };

      this.possibleRoles = [
        { name: roles.manager, value: 'manager' },
        { name: roles.admin, value: 'admin' },
      ];
      this.datetime = {
        name: 'expiration_time',
        options: {
          format: 'dd.MM.yyyy',
          altInputFormats: ['M!/d!/yyyy'],
          dateOptions: {
            minDate: moment()
              .add(1, 'days')
              .toDate(),
            startingDay: 1,
          },
        },
      };

      this.loading = true;
      this.loadData().finally(() => {
        this.loading = false;
      });
    }

    loadData() {
      this.projectModel.role = 'admin';

      if (this.resolve.editUser) {
        this.addText = gettext('Save');
        this.addTitle = gettext('Edit project member');
        this.projectModel.user = this.resolve.editUser;
        this.projectModel.role = this.resolve.editUser.role;
        this.projectModel.expiration_time = this.resolve.editUser
          .expiration_time
          ? new Date(this.resolve.editUser.expiration_time)
          : null;
        return this.$q.resolve();
      } else {
        return this.customersService
          .getAll({
            operation: 'users',
            UUID: this.resolve.currentCustomer.uuid,
          })
          .then(users => {
            this.users = users.filter(user => {
              return this.resolve.addedUsers.indexOf(user.uuid) === -1;
            });
          });
      }
    }

    saveUser() {
      this.errors = [];
      this.saving = true;
      return this.saveProjectPermissions().then(
        () => {
          this.close();
          this.saving = false;
        },
        error => {
          this.saving = false;
          this.errors = this.ErrorMessageFormatter.formatErrorFields(error);
        },
      );
    }

    saveProjectPermissions() {
      if (this.resolve.editUser) {
        if (
          this.resolve.editUser.role !== this.projectModel.role ||
          this.resolve.editUser.expiration_time !==
            this.projectModel.expiration_time
        ) {
          return this.checkPermissionAction();
        } else if (
          this.resolve.editUser.role === this.projectModel.role ||
          this.resolve.editUser.expiration_time ===
            this.projectModel.expiration_time
        ) {
          return this.$q.resolve();
        }
      } else {
        if (this.projectModel.user) {
          return this.createPermission(this.projectModel.role);
        }
        return this.$q.resolve();
      }
    }

    checkPermissionAction() {
      if (
        this.resolve.editUser.expiration_time !==
          this.projectModel.expiration_time &&
        this.resolve.editUser.role === this.projectModel.role
      ) {
        return this.updatePermission(this.resolve.editUser.permission);
      }
      return this.projectPermissionsService
        .deletePermission(this.resolve.editUser.permission)
        .then(() => {
          return this.createPermission(this.projectModel.role);
        });
    }

    updatePermission(permission) {
      let model = {};
      model.user = this.projectModel.user.url;
      model.role = this.projectModel.role;
      model.expiration_time = this.projectModel.expiration_time;
      model.project = this.resolve.currentProject.url;
      model.url = permission;
      return this.projectPermissionsService.update(model);
    }

    createPermission(role) {
      let instance = this.projectPermissionsService.$create();
      instance.user = this.projectModel.user.url;
      instance.project = this.resolve.currentProject.url;
      instance.expiration_time = this.projectModel.expiration_time;
      instance.role = role;
      return instance.$save();
    }
  },
};

export default addProjectMember;
