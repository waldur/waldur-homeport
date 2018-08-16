import template from './change-package-dialog.html';
import { openstackTemplateColumns, openstackTemplateFilters } from '../openstack-template';
import { getTemplateFilterOptions } from './utils';

class DialogController {
  // @ngInject
  constructor(openstackTenantChangePackageService, packageTemplatesService, $q) {
    this.service = openstackTenantChangePackageService;
    this.packageTemplatesService = packageTemplatesService;
    this.$q = $q;
  }

  $onInit() {
    this.tenant = this.resolve.resource;
    this.newTemplate = null;
    this.columns = openstackTemplateColumns;
    this.filterOptions = openstackTemplateFilters;
    this.templates = [];
    this.loading = true;

    this.$q.all([
      this.packageTemplatesService.loadTenantQuotasUsage(this.tenant).then(quotas => {
        this.quotasUsage = quotas;
      }),
      this.service.loadData(this.tenant).then(context => {
        this.package = context.package;
        this.template = context.template;
        this.templates = context.templates;
        this.filterOptions = getTemplateFilterOptions(context.templates, openstackTemplateFilters);
      }),
    ]).catch(response => {
      if (response) {
        this.errors = response.data;
      }
    }).finally(() => {
      this.loading = false;
    });
  }

  selectTemplate(template) {
    this.newTemplate = template;
  }

  submitForm() {
    return this.service.saveData({
      tenant: this.tenant,
      package: this.package,
      template: this.template,
      newTemplate: this.newTemplate
    }).then(tenant => {
      this.resolve.controller.reInitResource(tenant);
      this.close();
    }).catch(response => {
      if (response) {
        this.errors = response.data;
      }
    });
  }
}

const openstackTenantChangePackageDialog = {
  template: template,
  controller: DialogController,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  }
};

export default openstackTenantChangePackageDialog;
