import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';
import { ActionContext } from '@waldur/resource/actions/types';

export function tenantHasPackage(tenant: OpenStackTenant): boolean {
  return !!(tenant.extra_configuration && tenant.extra_configuration.package_uuid);
}

export function userCanModifyTenant(ctx: ActionContext): string {
  if (ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES && !ctx.user.is_staff) {
    return translate('Only staff can manage OpenStack tenant.');
  }
}

// The function filters out empty filter categories based on categories present in template choices.
export function getTemplateFilterOptions(templates, templateFilters) {
  if (!!templates && !!templateFilters.choices) {
    const filterCategories = [];
    templates.forEach(choice => {
      filterCategories.push(choice.category);
    });
    const choices = templateFilters.choices.filter(choice => {
      return filterCategories.indexOf(choice.value) !== -1 || choice.label === 'All categories';
    });
    return {
      name: 'category',
      choices,
      defaultValue: '',
    };
  }
}
