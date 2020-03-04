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

const ARTICLE_CODE_PATTERN = new RegExp(
  '^[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]$',
);

export const articleCodeValidator = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate('Code is too short.');
  }
  if (!value.match(ARTICLE_CODE_PATTERN)) {
    return translate('Code should consist of latin symbols or numbers.');
  }
};
