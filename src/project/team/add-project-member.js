import { CustomersService } from '@waldur/customer/services/CustomersService';
import { ProjectPermissionsService } from '@waldur/customer/services/ProjectPermissionsService';
import { closeModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

import template from './add-project-member.html';

const addProjectMember = {
  template,
  bindings: {
    resolve: '<',
  },
  controller: class AddProjectMemberDialogController {
    // @ngInject
    constructor($q, ENV, ErrorMessageFormatter) {
      this.$q = $q;
      this.ENV = ENV;
      this.ErrorMessageFormatter = ErrorMessageFormatter;
    }

    close() {
      store.dispatch(closeModalDialog());
    }

    $onInit() {
      const roles = this.ENV.roles;
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
            minDate: moment().add(1, 'days').toDate(),
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
        return CustomersService.getUsers(
          this.resolve.currentCustomer.uuid,
        ).then((users) => {
          this.users = users.filter((user) => {
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
        (error) => {
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
      return ProjectPermissionsService.delete(
        this.resolve.editUser.permission,
      ).then(() => {
        return this.createPermission(this.projectModel.role);
      });
    }

    updatePermission(permission) {
      return ProjectPermissionsService.update(permission, {
        user: this.projectModel.user.url,
        role: this.projectModel.role,
        expiration_time: this.projectModel.expiration_time,
        project: this.resolve.currentProject.url,
      });
    }

    createPermission(role) {
      return ProjectPermissionsService.create({
        user: this.projectModel.user.url,
        project: this.resolve.currentProject.url,
        expiration_time: this.projectModel.expiration_time,
        role: role,
      });
    }
  },
};

export default addProjectMember;
