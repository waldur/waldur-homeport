import { templateParser, parseQuotasUsage, parseComponents } from '../utils';

// @ngInject
export default class openstackTenantChangePackageService {
  // Public API consists of two methods:
  // * loadData - returns promise with fields {package, template, templates}
  // * saveData - accepts dictionary with fields {tenant, package, template, newTemplate}

  constructor(
    $q,
    resourcesService,
    packageTemplatesService,
    openstackPackagesService,
    ncUtilsFlash) {
    this.$q = $q;
    this.resourcesService = resourcesService;
    this.packageTemplatesService = packageTemplatesService;
    this.openstackPackagesService = openstackPackagesService;
    this.ncUtilsFlash = ncUtilsFlash;
  }

  loadData(tenant) {
    let context = { tenant };
    return this.loadTenantQuotasUsage(context)
          .then(this.loadTenantPackage.bind(this))
          .then(this.loadPackageTemplate.bind(this))
          .then(this.loadTemplates.bind(this));
  }

  saveData(context) {
    return this.changePackage(context).then(() => {
      this.ncUtilsFlash.success(gettext('Tenant package has been changed.'));
    }).catch(response => {
      this.ncUtilsFlash.error(gettext('Unable to change tenant package.'));
      return this.$q.reject(response);
    });
  }

  // Private API section

  loadTenantQuotasUsage(context) {
    return this.resourcesService.$get(null, null, context.tenant.url)
    .then(tenant => angular.extend(context, {
      quotas: parseQuotasUsage(tenant.quotas)
    }));
  }

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
      templates: templates.map(templateParser).filter(this.checkTemplate.bind(this, context))
    }));
  }

  checkTemplate(context, template) {
    // Exclude current package template
    if (template.uuid === context.template.uuid) {
      return false;
    }

    // Allow to change package only if current usage of all quotas <= new package quotas
    const components = parseComponents(template.components);
    return (
      context.quotas.cores <= components.cores &&
      context.quotas.ram <= components.ram &&
      context.quotas.disk <= components.disk);
  }

  changePackage(context) {
    return this.openstackPackagesService.change(context.package.uuid, context.newTemplate.uuid);
  }
}
