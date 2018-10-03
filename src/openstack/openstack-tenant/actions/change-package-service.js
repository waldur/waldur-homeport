import { templateParser } from '../../utils';

export default class openstackTenantChangePackageService {
  // Public API consists of two methods:
  // * loadData - returns promise with fields {package, template, templates}
  // * saveData - accepts dictionary with fields {tenant, package, template, newTemplate}

  // @ngInject
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
    return this.loadTenantPackage(context)
          .then(this.loadPackageTemplate.bind(this))
          .then(this.loadTemplates.bind(this));
  }

  saveData(context) {
    return this.changePackage(context).then(() => {
      return this.loadTenant(context).then(tenant => {
        this.ncUtilsFlash.success(gettext('Tenant package has been changed.'));
        return tenant;
      });
    }).catch(response => {
      this.ncUtilsFlash.error(gettext('Unable to change tenant package.'));
      return this.$q.reject(response);
    });
  }

  // Private API section

  loadTenant(context) {
    return this.resourcesService.$get(null, null, context.tenant.url);
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
    return this.packageTemplatesService.loadTemplates(context.tenant, context.template
    ).then(templates => angular.extend(context, {templates: templates}));
  }

  changePackage(context) {
    return this.openstackPackagesService.change(context.package.uuid, context.newTemplate.uuid);
  }
}
