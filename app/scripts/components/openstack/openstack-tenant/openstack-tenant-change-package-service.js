import { templateParser } from '../utils';

// @ngInject
export default class openstackTenantChangePackageService {
  // Public API consists of two methods:
  // * loadData - returns promise with fields {package, template, templates}
  // * saveData - accepts dictionary with fields {tenant, package, template, newTemplate}

  constructor($q, $state, packageTemplatesService,
              openstackPackagesService, issuesService, ncUtilsFlash, ISSUE_IDS, coreUtils, $filter) {
    this.$q = $q;
    this.$state = $state;
    this.packageTemplatesService = packageTemplatesService;
    this.openstackPackagesService = openstackPackagesService;
    this.issuesService = issuesService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.ISSUE_IDS = ISSUE_IDS;
    this.coreUtils = coreUtils;
    this.$filter = $filter;
  }

  loadData(tenant) {
    let context = {tenant};
    return this.loadTenantPackage(context)
          .then(this.loadPackageTemplate.bind(this))
          .then(this.loadTemplates.bind(this));
  }

  saveData(context) {
    if (this.compareTemplates(context.newTemplate, context.template)) {
      return this.createIssue(context).then(issue => {
        this.ncUtilsFlash.success(gettext('Request to change tenant package has been created.'));
        return this.$state.go('support.detail', {uuid: issue.uuid});
      }).catch(response => {
        this.ncUtilsFlash.error(gettext('Unable to create request to change tenant package.'));
        return this.$q.reject(response);
      });
    } else {
      return this.extendPackage(context).then(() => {
        this.ncUtilsFlash.success(gettext('Tenant package has been upgraded.'));
      }).catch(response => {
        this.ncUtilsFlash.error(gettext('Unable to upgrade tenant package.'));
        return this.$q.reject(response);
      });
    }
  }

  // Private API section
  loadTenantPackage(context) {
    return this.openstackPackagesService.getList({
      tenant_uuid: context.tenant.uuid
    }).then(packages => {
      if (packages.length === 1) {
        return angular.extend(context, {
          package: packages[0]
        });
      } else {
        return this.$q.reject();
      }
    });
  }

  loadPackageTemplate(context) {
    return this.packageTemplatesService.$get(
      null, context.package.template
    ).then(template => angular.extend(context, {
      template: templateParser(template)
    }));
  }

  loadTemplates(context) {
    return this.packageTemplatesService.getAll({
      service_settings_uuid: context.tenant.service_settings_uuid
    }).then(templates => angular.extend(context, {
      templates: templates.map(templateParser).filter(
        template => template.uuid !== context.template.uuid
      )
    }));
  }

  compareTemplates(a, b) {
    return a.cores < b.cores || a.ram < b.ram || a.disk < b.disk;
  }

  createIssue(context) {
    return this.issuesService.createIssue({
      summary: this.formatIssueSummary(context),
      description: this.$filter('translate')(this.formatIssueDescription(context)),
      resource: context.tenant.url,
      is_reported_manually: true,
      type: this.ISSUE_IDS.CHANGE_REQUEST
    });
  }

  extendPackage(context) {
    return this.openstackPackagesService.extend(context.package.uuid, context.newTemplate.uuid);
  }

  formatIssueSummary(context) {
    return this.coreUtils.templateFormatter(gettext('Please downgrade tenant {tenantName} to VPC {vpcName}'),
      { tenantName: context.tenant.name, vpcName: context.newTemplate.name });
  }

  formatIssueDescription(context) {
    // Indentation is not used here in order to format description correctly
    return this.coreUtils.templateFormatter(gettext(
      `Tenant name: {tenantName};
       tenant UUID: {tenantUUID};
       requested VPC template name: {templateName};
       requested VPC template UUID: {templateUUID}`),
      { tenantName: context.tenant.name, tenantUUID: context.tenant.uuid, templateName: context.newTemplate.name,
        templateUUID: context.newTemplate.uuid });
  }
}
