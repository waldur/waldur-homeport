import template from './openstack-tenant-change-package.html';
import {
  openstackTemplateColumns,
  templateComparator,
  templateParser,
  templateFormatter
} from './openstack-template';

export default function openstackTenantChangePackageDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: DialogController,
    controllerAs: '$ctrl',
    bindToController: true
  }
}

// @ngInject
class DialogController {
  constructor($scope, $filter, $state, $q, ncUtilsFlash,
              packageTemplatesService,
              openstackPackagesService,
              issuesService) {
    this.$filter = $filter;
    this.$state = $state;
    this.$q = $q;
    this.ncUtilsFlash = ncUtilsFlash;
    this.packageTemplatesService = packageTemplatesService;
    this.openstackPackagesService = openstackPackagesService;
    this.issuesService = issuesService;

    this.newTemplate = null;
    this.columns = openstackTemplateColumns;
    this.tenant = $scope.resource;
    this.dismiss = $scope.$dismiss;
    this.close = $scope.$close;
    this.parent = $scope.controller;
    this.templates = [];
    this.init();
  }

  init() {
    this.loading = true;
    this.loadTenantPackage()
        .then(this.loadPackageTemplate.bind(this))
        .then(this.loadTemplates.bind(this))
        .finally(() => {
          this.loading = false;
        });
  }

  loadTenantPackage() {
    return this.openstackPackagesService.getList({
      tenant: this.tenant.uuid
    }).then(packages => {
      if (packages.length == 1) {
        this.openstackPackage = packages[0];
      } else {
        return this.$q.reject();
      }
    });
  }

  loadPackageTemplate() {
    const request = this.packageTemplatesService.$get(null, this.openstackPackage.template);
    return request.then(template => {
      this.packageTemplate = templateParser(template);
      this.packageTemplateDisplay = templateFormatter(this.$filter, this.packageTemplate);
    });
  }

  loadTemplates() {
    return this.packageTemplatesService.getAll({
      settings_uuid: this.tenant.service_settings_uuid
    }).then(templates => {
      this.templates = templates.map(templateParser).filter(
        template => template.uuid !== this.packageTemplate.uuid
      );
    });
  }

  submitForm() {
    if (templateComparator(this.newTemplate, this.packageTemplate) == -1) {
      return this.createIssue();
    } else {
      return this.extendPackage();
    }
  }

  createIssue() {
    return this.issuesService.createIssue({
      summary: `Please downgrade tenant '${this.tenant.name}' to VPC '${this.newTemplate.name}'`,
      description: `
Tenant name: ${this.tenant.name};
tenant UUID: ${this.tenant.uuid};
requested VPC template name: ${this.newTemplate.name};
requested VPC template UUID: ${this.newTemplate.uuid}`
    }).then(() => {
      return this.$state.go('support.list').then(() => this.close());
    }).catch(error => {
      this.ncUtilsFlash.error('Unable to create request to downgrade tenant.');
    });
  }

  extendPackage() {
    return this.openstackPackagesService.extend(
      this.openstackPackage.uuid,
      this.newTemplate.uuid
    ).then(() => {
      this.parent.reInitResource(this.tenant).then(() => this.close());
    }).catch(response => {
      this.errors = response.data;
      this.ncUtilsFlash.error('Unable to upgrade tenant VPC package.');
    });
  }

  selectTemplate(template) {
    this.newTemplate = template;
  }
}
