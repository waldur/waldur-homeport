import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export function setStateBreadcrumbs(): void {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  BreadcrumbsService.items = [
    {
      label: translate('Organization workspace'),
      state: 'organization.details',
    },
    {
      label: translate('Public offerings'),
      state: 'marketplace-vendor-offerings',
    },
  ];
}
