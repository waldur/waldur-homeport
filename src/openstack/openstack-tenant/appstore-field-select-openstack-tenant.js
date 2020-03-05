import template from './appstore-field-select-openstack-tenant.html';

class AppstoreFieldSelectOpenstackTenantController {
  // @ngInject
  constructor(ncUtilsFlash, openstackTenantsService, currentStateService) {
    this.ncUtilsFlash = ncUtilsFlash;
    this.openstackTenantsService = openstackTenantsService;
    this.currentStateService = currentStateService;
  }

  $onInit() {
    this.loading = true;
    this.currentStateService.getProject().then(project => {
      this.openstackTenantsService
        .getAll({
          field: ['name', 'backend_id'],
          project_uuid: project.uuid,
        })
        .then(tenants => {
          this.choices = tenants.map(tenant => ({
            display_name: tenant.name,
            value: `Tenant UUID: ${tenant.backend_id}. Name: ${tenant.name}`,
          }));
          this.loading = false;
          this.loaded = true;
        })
        .catch(response => {
          this.ncUtilsFlash.errorFromResponse(
            response,
            gettext('Unable to get list of OpenStack tenants.'),
          );
          this.loading = false;
          this.loaded = false;
        });
    });
  }
}

const appstoreFieldSelectOpenstackTenant = {
  template,
  bindings: {
    field: '<',
    model: '<',
  },
  controller: AppstoreFieldSelectOpenstackTenantController,
};

export default appstoreFieldSelectOpenstackTenant;
