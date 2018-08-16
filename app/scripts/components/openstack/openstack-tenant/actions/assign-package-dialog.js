import template from './assign-package-dialog.html';
import { openstackTemplateColumns, openstackTemplateFilters } from '../openstack-template';
import { getTemplateFilterOptions } from './utils';

const openstackTenantAssignPackageDialog = {
  template,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
  controller: class OpenStackTenantAssignPackageDialog {
    // @ngInject
    constructor($http, ENV, ncUtilsFlash, packageTemplatesService) {
      this.$http = $http;
      this.apiEndpoint = ENV.apiEndpoint;
      this.ncUtilsFlash = ncUtilsFlash;
      this.packageTemplatesService = packageTemplatesService;
      this.tenant = this.resolve.resource;
      this.newTemplate = null;
      this.columns = openstackTemplateColumns;
      this.filterOptions = openstackTemplateFilters;
    }

    $onInit() {
      // replace with package templates service
      this.packageTemplatesService.loadTemplates(this.tenant).then(templates => {
        this.templates = templates;
        this.filterOptions = getTemplateFilterOptions(templates, openstackTemplateFilters);
      });
    }

    selectTemplate(template) {
      this.newTemplate = template;
    }

    assignPackage() {
      this.$http.post(`${this.apiEndpoint}api/openstack-packages/assign/`, {
        tenant: this.tenant.url,
        template: this.newTemplate.url,
      }).then(() => {
        this.close();
        this.ncUtilsFlash.success(gettext('Tenant has been assigned to the package.'));
      }).catch(response => {
        this.ncUtilsFlash.errorFromResponse(response, gettext('Package could not be assigned.'));
      });
    }
  }
};

export default openstackTenantAssignPackageDialog;
