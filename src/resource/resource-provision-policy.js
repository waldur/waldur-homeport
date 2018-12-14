// @ngInject
export default function ResourceProvisionPolicy(ENV, ncUtils, customersService) {
  function isProjectManager(project) {
    if (!project.permissions) {
      return true;
    }
    return project.permissions.filter(permission => permission.role === 'manager').length === 1;
  }
  return {
    checkResource(user, customer, project, key) {
      let disabled, errorMessage;
      if (ncUtils.isCustomerQuotaReached(customer, 'resource')) {
        disabled = true;
        errorMessage = gettext('Quota has been reached.');
      } else if (key === ENV.resourcesTypes.private_clouds) {
        // User can create virtual private cloud if one following conditions are met:
        // 1) user is staff;
        // 2) user is organization owner;
        // 3) user is project manager and MANAGER_CAN_MANAGE_TENANTS is true.
        if (ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES && !user.is_staff) {
          disabled = true;
          errorMessage = gettext('Only staff can create virtual private cloud.');
        }
        if (!customersService.checkCustomerUser(customer, user)) {
          if (!ENV.plugins.WALDUR_OPENSTACK.MANAGER_CAN_MANAGE_TENANTS || !isProjectManager(project)) {
            disabled = true;
            errorMessage = gettext('You do not have permissions to create private cloud for current project.');
          }
        }
      }
      return { disabled, errorMessage };
    }
  };
}
