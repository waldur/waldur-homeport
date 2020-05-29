import { closeModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

import template from './add-team-member.html';
import './add-team-member.scss';

const addTeamMember = {
  template,
  bindings: {
    resolve: '<',
  },
  controller: class AddTeamMemberDialogController {
    // @ngInject
    constructor(
      $q,
      customersService,
      customerPermissionsService,
      projectPermissionsService,
      ENV,
      ErrorMessageFormatter,
      $filter,
    ) {
      this.$q = $q;
      this.customersService = customersService;
      this.customerPermissionsService = customerPermissionsService;
      this.projectPermissionsService = projectPermissionsService;
      this.ENV = ENV;
      this.ErrorMessageFormatter = ErrorMessageFormatter;
      this.$filter = $filter;
    }

    close() {
      store.dispatch(closeModalDialog());
    }

    $onInit() {
      this.roles = this.ENV.roles;
      this.addText = gettext('Save');
      this.addTitle = gettext('Edit team member');
      this.userModel = {
        expiration_time: null,
      };

      this.canChangeRole = this.customersService.checkCustomerUser(
        this.resolve.currentCustomer,
        this.resolve.currentUser,
      );

      this.canManageOwner =
        this.resolve.currentUser.is_staff ||
        (this.customersService.isOwner(
          this.resolve.currentCustomer,
          this.resolve.editUser,
        ) &&
          this.customersService.isOwner(
            this.resolve.currentCustomer,
            this.resolve.currentUser,
          ) &&
          this.ENV.plugins.WALDUR_CORE.OWNERS_CAN_MANAGE_OWNERS);

      if (!this.canChangeRole) {
        this.helpText = gettext('You cannot change your own role.');
      }
      if (!this.canManageOwner) {
        this.helpText = gettext('You cannot manage other organization owner.');
      }

      this.roleField = {
        name: 'role',
        disableInput: !this.canChangeRole,
        choices: [
          { value: 'admin', display_name: this.ENV.roles.admin },
          { value: 'manager', display_name: this.ENV.roles.manager },
        ],
      };
      this.projectExpirationTimeField = {
        name: 'expiration_time',
        disableInput: !this.canChangeRole,
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

      this.ownerExpirationTimeField = angular.extend(
        {},
        this.projectExpirationTimeField,
        {
          disableInput: !this.canChangeRole || !this.canManageOwner,
        },
      );

      this.formatData();
    }

    formatData() {
      this.projects = [];
      this.userModel.user = this.resolve.editUser;
      this.userModel.role = this.resolve.editUser.role;
      this.userModel.expiration_time = this.resolve.editUser.expiration_time
        ? new Date(this.resolve.editUser.expiration_time)
        : null;

      this.projects = angular
        .copy(this.resolve.currentCustomer.projects)
        .map(project => {
          const displayProject = {
            role: null,
            permission: null,
            expiration_time: null,
            uuid: project.uuid,
            name: project.name,
            url: project.url,
          };
          this.resolve.editUser.projects.some(permissionProject => {
            if (permissionProject.uuid === project.uuid) {
              displayProject.role = permissionProject.role;
              displayProject.permission = permissionProject.permission;
              displayProject.expiration_time = permissionProject.expiration_time
                ? new Date(permissionProject.expiration_time)
                : null;
            }
            return permissionProject.uuid === project.uuid;
          });
          return displayProject;
        });

      this.emptyProjectList = !this.projects.length;
    }

    saveUser() {
      this.errors = [];
      this.saving = true;
      return this.$q
        .all([this.saveCustomerPermission(), this.saveProjectPermissions()])
        .then(
          () => {
            this.close();
            this.saving = false;
          },
          error => {
            this.errors = this.ErrorMessageFormatter.formatErrorFields(error);
            this.saving = false;
          },
        );
    }

    saveCustomerPermission() {
      if (
        this.userModel.role !== this.resolve.editUser.role &&
        !this.userModel.role
      ) {
        return this.customerPermissionsService.delete(
          this.resolve.editUser.permission,
        );
      } else if (!this.resolve.editUser.role && this.userModel.role) {
        return this.createCustomerPermission();
      } else if (
        this.userModel.expiration_time !== this.resolve.editUser.expiration_time
      ) {
        return this.customerPermissionsService.update(
          this.resolve.editUser.permission,
          { expiration_time: this.userModel.expiration_time },
        );
      }
    }

    createCustomerPermission() {
      return this.customerPermissionsService.create({
        user: this.resolve.editUser.url,
        role: this.userModel.role,
        customer: this.resolve.currentCustomer.url,
        expiration_time: this.userModel.expiration_time,
      });
    }

    saveProjectPermissions() {
      const updatePermissions = [],
        createdPermissions = [],
        permissionsToDelete = [];

      this.projects.forEach(project => {
        let exists = false,
          update = false;
        this.resolve.editUser.projects.forEach(existingPermission => {
          if (project.permission === existingPermission.permission) {
            exists = true;
            if (
              project.role === existingPermission.role &&
              project.expiration_time !== existingPermission.expiration_time
            ) {
              update = true;
            } else if (
              (!project.role && existingPermission.role) ||
              (project.role &&
                existingPermission.role &&
                project.role !== existingPermission.role)
            ) {
              permissionsToDelete.push(existingPermission.permission);
            }
            if (project.role && project.role !== existingPermission.role) {
              createdPermissions.push(project);
            }
          }
        });

        if (update) {
          updatePermissions.push(project);
        } else if (project.role && !exists) {
          createdPermissions.push(project);
        }
      });

      const removalPromises = permissionsToDelete.map(permission => {
        return this.projectPermissionsService.delete(permission);
      });

      const renewalPromises = updatePermissions.map(permission => {
        return this.projectPermissionsService.update(permission.permission, {
          role: permission.role,
          expiration_time: permission.expiration_time,
        });
      });

      return this.$q.all(removalPromises).then(() => {
        const creationPromises = createdPermissions.map(permission => {
          return this.projectPermissionsService.create({
            user: this.resolve.editUser.url,
            role: permission.role,
            project: permission.url,
            expiration_time: permission.expiration_time,
          });
        });
        return this.$q.all(renewalPromises.concat(creationPromises));
      });
    }
  },
};

export default addTeamMember;
